# 🤝 Contributing to Glow Cycle

Thank you for contributing to Glow Cycle! This guide will help you get started.

## 📋 Before You Start

1. Read the [SETUP.md](SETUP.md) guide
2. Make sure your development environment is ready
3. Check existing issues and pull requests
4. Join the team communication channel

## 🔄 Development Workflow

### 1. Pick an Issue

- Browse [GitHub Issues](https://github.com/puddl3duck/glowcycle/issues)
- Comment on the issue you want to work on
- Wait for assignment before starting work

### 2. Create a Branch

```bash
# Update your local main branch
git checkout main
git pull origin main

# Create a new branch
git checkout -b feature/your-feature-name
```

**Branch naming conventions:**
- `feature/` - New features (e.g., `feature/add-calendar`)
- `fix/` - Bug fixes (e.g., `fix/navbar-mobile`)
- `docs/` - Documentation (e.g., `docs/update-readme`)
- `style/` - UI/styling (e.g., `style/improve-colors`)
- `refactor/` - Code refactoring (e.g., `refactor/clean-css`)

### 3. Make Your Changes

- Write clean, readable code
- Follow the project's code style
- Test your changes thoroughly
- Commit frequently with clear messages

### 4. Commit Your Changes

```bash
git add .
git commit -m "Brief description of changes"
```

**Commit message format:**
```
type: Brief description (50 chars or less)

More detailed explanation if needed (wrap at 72 chars).
Explain what and why, not how.

Fixes #123
```

**Types:**
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

**Examples:**
```
feat: Add mood tracking calendar view

fix: Resolve navbar overlap on mobile devices

docs: Update setup instructions for Windows users
```

### 5. Push Your Branch

```bash
git push origin feature/your-feature-name
```

### 6. Create a Pull Request

1. Go to the [repository on GitHub](https://github.com/puddl3duck/glowcycle)
2. Click "Pull Requests" → "New Pull Request"
3. Select your branch
4. Fill out the PR template
5. Request review from team members

## 📝 Code Style Guidelines

### HTML

```html
<!-- Use semantic HTML5 elements -->
<section class="features-section">
    <article class="feature-card">
        <h2>Feature Title</h2>
        <p>Description text here.</p>
    </article>
</section>

<!-- Indent with 4 spaces -->
<!-- Use lowercase for tags and attributes -->
<!-- Add comments for major sections -->
```

### CSS

```css
/* Use CSS custom properties */
:root {
    --primary-color: #FF9B9B;
    --secondary-color: #9B7EBD;
}

/* Group related properties */
.feature-card {
    /* Layout */
    display: flex;
    flex-direction: column;
    
    /* Spacing */
    padding: 2rem;
    margin-bottom: 1rem;
    
    /* Visual */
    background: white;
    border-radius: 20px;
    
    /* Animation */
    transition: all 0.3s ease;
}

/* Add comments for complex styles */
/* Use meaningful class names */
```

### JavaScript

```javascript
// Use const and let, avoid var
const API_URL = 'https://api.example.com';
let currentUser = null;

// Use meaningful variable names
function calculateCycleDay(lastPeriodDate, currentDate) {
    const daysDiff = Math.floor((currentDate - lastPeriodDate) / (1000 * 60 * 60 * 24));
    return (daysDiff % 28) + 1;
}

// Add JSDoc comments for functions
/**
 * Saves journal entry to localStorage
 * @param {Object} entry - The journal entry object
 * @param {string} entry.date - ISO date string
 * @param {string} entry.mood - User's mood
 * @param {string} entry.text - Journal text content
 * @returns {boolean} Success status
 */
function saveJournalEntry(entry) {
    // Implementation
}
```

### Python (when added)

```python
# Follow PEP 8 style guide
# Use type hints
def calculate_cycle_phase(day: int) -> str:
    """
    Calculate menstrual cycle phase based on day number.
    
    Args:
        day: Day number in cycle (1-28)
        
    Returns:
        Phase name as string
    """
    if 1 <= day <= 5:
        return "menstrual"
    elif 6 <= day <= 12:
        return "follicular"
    elif 13 <= day <= 17:
        return "ovulation"
    else:
        return "luteal"
```

## 🧪 Testing

### Before Submitting PR

- [ ] Test on Chrome, Firefox, and Safari
- [ ] Test on mobile viewport (responsive design)
- [ ] Check console for errors
- [ ] Verify all links work
- [ ] Test with different screen sizes
- [ ] Validate HTML/CSS (use W3C validators)

### Manual Testing Checklist

- [ ] Navigation works correctly
- [ ] Forms submit properly
- [ ] Animations are smooth
- [ ] Images load correctly
- [ ] No console errors
- [ ] localStorage works as expected

## 🐛 Reporting Bugs

### Before Reporting

1. Check if the bug has already been reported
2. Try to reproduce the bug consistently
3. Test on different browsers if possible

### Bug Report Template

```markdown
**Description**
Clear description of the bug

**Steps to Reproduce**
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

**Expected Behavior**
What should happen

**Actual Behavior**
What actually happens

**Screenshots**
If applicable, add screenshots

**Environment**
- OS: [e.g., Windows 11, macOS 13]
- Browser: [e.g., Chrome 120, Firefox 121]
- Screen size: [e.g., 1920x1080, mobile]
```

## 💡 Suggesting Features

### Feature Request Template

```markdown
**Feature Description**
Clear description of the feature

**Problem It Solves**
What problem does this solve?

**Proposed Solution**
How should it work?

**Alternatives Considered**
Other ways to solve this

**Additional Context**
Mockups, examples, etc.
```

## 📚 Documentation

### When to Update Documentation

- Adding new features
- Changing existing functionality
- Fixing bugs that affect usage
- Adding new dependencies
- Changing setup process

### Documentation Files

- `README.md` - Project overview
- `SETUP.md` - Setup instructions
- `CONTRIBUTING.md` - This file
- `QUICKSTART.md` - Quick reference
- Code comments - Inline documentation

## ✅ Pull Request Checklist

Before submitting your PR, make sure:

- [ ] Code follows style guidelines
- [ ] All tests pass
- [ ] Documentation is updated
- [ ] Commit messages are clear
- [ ] Branch is up to date with main
- [ ] No merge conflicts
- [ ] PR description is complete
- [ ] Screenshots added (if UI changes)

## 🔍 Code Review Process

### What Reviewers Look For

- Code quality and readability
- Adherence to style guidelines
- Proper error handling
- Performance considerations
- Security best practices
- Documentation completeness

### Responding to Feedback

- Be open to suggestions
- Ask questions if unclear
- Make requested changes promptly
- Thank reviewers for their time
- Mark conversations as resolved

## 🎯 Getting Help

### Resources

- **Documentation**: Check `SETUP.md` and `README.md`
- **Issues**: Search existing issues
- **Discussions**: Use GitHub Discussions
- **Team Chat**: Ask in team channel

### Who to Ask

- **Setup issues**: Check `SETUP.md` or ask in chat
- **Code questions**: Ask in team channel
- **Bug reports**: Create a GitHub issue
- **Feature ideas**: Create a GitHub discussion

## 🌟 Recognition

Contributors will be recognized in:
- GitHub contributors page
- Project README (for significant contributions)
- Release notes

## 📄 License

By contributing, you agree that your contributions will be licensed under the same license as the project.

---

**Thank you for contributing to Glow Cycle! 🌸✨**

Every contribution, no matter how small, helps make this project better for everyone.
