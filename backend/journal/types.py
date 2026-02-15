from enum import Enum

class FeelingType(str, Enum):
    amazing = "amazing"
    happy = "happy"
    okay = "okay"
    tired = "tired"
    sad = "sad"

class DayPeriod(str, Enum):
    day = "morning"
    night = "evening"

    @classmethod
    def from_bool(cls, night: bool):
        return cls.night if night else cls.day
