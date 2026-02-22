import json
import os
import base64
import boto3

s3 = boto3.client("s3")
rekognition = boto3.client("rekognition")
bedrock = boto3.client("bedrock-runtime")

BUCKET = os.environ["BUCKET_NAME"]
MODEL_ID = os.environ["BEDROCK_MODEL_ID"]

def lambda_handler(event, context):
    try:
        body = json.loads(event.get("body") or "{}")
        s3_key = body["s3Key"]

        # -------------------------
        # 1) Rekognition face check
        # -------------------------
        face_resp = rekognition.detect_faces(
            Image={"S3Object": {"Bucket": BUCKET, "Name": s3_key}},
            Attributes=["ALL"]
        )

        faces = face_resp.get("FaceDetails", [])
        if not faces:
            return _error(400, "No face detected. Please retake the photo in good lighting, facing the camera.")

        face = sorted(faces, key=lambda f: f.get("Confidence", 0), reverse=True)[0]

        conf = face.get("Confidence", 0)
        quality = face.get("Quality", {})
        brightness = quality.get("Brightness", 0)
        sharpness = quality.get("Sharpness", 0)

        if conf < 90:
            return _error(400, "Face is not clear enough. Please retake the photo with your face centered in the oval.")
        if brightness < 35:
            return _error(400, "Photo is too dark. Please move to brighter lighting and try again.")
        if sharpness < 35:
            return _error(400, "Photo is too blurry. Hold still and retake the photo.")

        # -------------------------
        # 2) Get image bytes from S3
        # -------------------------
        obj = s3.get_object(Bucket=BUCKET, Key=s3_key)
        image_bytes = obj["Body"].read()
        image_b64 = base64.b64encode(image_bytes).decode("utf-8")

        # -------------------------
        # 3) Bedrock Claude analysis
        # -------------------------
        user_context = {
            "timeOfDay": body.get("timeOfDay"),
            "cyclePhase": body.get("cyclePhase"),
            "skinGoals": body.get("skinGoals", []),
            "rekognition": {
                "confidence": conf,
                "brightness": brightness,
                "sharpness": sharpness,
                "pose": face.get("Pose", {}),
            }
        }

        system_prompt = """You are GlowCycle's experienced skincare assistant.
Rules:
- Do NOT diagnose medical conditions.
- Do NOT mention diseases.
- Provide cosmetic skincare insights and routines only.
- Return ONLY valid JSON (no markdown, no extra text, no code fences).
- Generate at least 3 types of product recommendation based on the analysis.
- Generate exactly 3 tips in the "tips" array, no more, no less.
- Provide responses with Australian spelling.
- Provide exactly 2 concerns detected in the "concerns_detected" array.
- Generate atmost 5 type of product recommendation, Tips and concerns detected based on the analysis. 
- Use appropriate emoticons at the start of each recommendation to make it look fun.
- """

        schema = """{
            "summary": "...",
            "concerns_detected": ["concern_detected1","concern_detected2"],
            "metrics": {
                "radiance": 0,
                "moisture": 0,
                "texture": 0,
                "pores": 0,
                "dark_circles": 0,
                "oiliness": 0,
                "redness": 0,
            },
            "overall_skin_health": 0
            "am_routine": ["..."],
            "pm_routine": ["..."],
            "tips": ["tip1", "tip2", "tip3"],,
            "disclaimer": "..."
        }"""

        user_prompt = f"""Analyse the face image and provide skincare recommendations.
        Use the user context and Rekognition quality info to adjust suggestions.

User context:
{json.dumps(user_context)}

Return JSON in this exact schema (numbers should be 0-100):
{schema}"""

        req = {
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": 2200,
            "system": system_prompt,
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": user_prompt},
                        {
                            "type": "image",
                            "source": {
                                "type": "base64",
                                "media_type": "image/jpeg",
                                "data": image_b64
                            }
                        }
                    ],
                }
            ],
        }

        resp = bedrock.invoke_model(
            modelId=MODEL_ID,
            contentType="application/json",
            accept="application/json",
            body=json.dumps(req),
        )

        raw = json.loads(resp["body"].read())
        print("Bedrock raw response:", json.dumps(raw))  # for debugging

        text = raw["content"][0]["text"].strip()
        print("Claude text output:", text)  # for debugging
        

        # Strip markdown code fences if Claude added them despite instructions
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
            text = text.strip()

        result = json.loads(text)
        result["face_data"] = {
            "landmarks": face.get("Landmarks", []),
            "bounding_box": face.get("BoundingBox", {}),
            }
        result["image_quality"] = {
            "brightness": brightness,
            "sharpness": sharpness,
            "face_confidence": conf
        }

        return {
            "statusCode": 200,
            "headers": {"Content-Type": "application/json", "Access-Control-Allow-Origin": "*"},
            "body": json.dumps(result),
        }

    except Exception as e:
        import traceback
        print("UNHANDLED EXCEPTION:", str(e))
        print(traceback.format_exc())
        return {
            "statusCode": 500,
            "headers": {"Content-Type": "application/json", "Access-Control-Allow-Origin": "*"},
            "body": json.dumps({"error": str(e)}),
        }


def _error(code, message):
    return {
        "statusCode": code,
        "headers": {"Content-Type": "application/json", "Access-Control-Allow-Origin": "*"},
        "body": json.dumps({"error": message}),
    }