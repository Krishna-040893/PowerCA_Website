
# Website Security Code Review Prompt for Claude Code

## Overview
Perform a comprehensive security analysis and code review of this website codebase. Conduct a thorough malware scan and vulnerability assessment. **ANALYSIS ONLY - DO NOT MAKE ANY CHANGES WITHOUT EXPLICIT APPROVAL.**

## Primary Security Analysis Tasks

### 1. Malware Detection & Analysis
- Scan all files for suspicious code patterns, obfuscated JavaScript, encoded PHP, or hidden backdoors
- Look for unauthorized file uploads, especially in upload directories
- Check for suspicious .htaccess modifications or redirects
- Identify any base64 encoded content or eval() functions that could be malicious
- Search for common malware signatures (c99 shell, r57 shell, WSO shell, etc.)
- Review file modification dates for recently changed files that shouldn't have been modified

### 2. SQL Injection Vulnerability Assessment
- Analyze all database queries for proper parameterization/prepared statements
- Check user input sanitization in forms, URL parameters, and POST data
- Review authentication and login mechanisms for SQL injection flaws
- Examine search functionality and dynamic query building
- Verify proper escaping of special characters in database operations
- Check for direct concatenation of user input in SQL statements

### 3. Cross-Site Scripting (XSS) Analysis
- Review all user input fields for proper output encoding
- Check for reflected, stored, and DOM-based XSS vulnerabilities
- Analyze JavaScript code for unsafe innerHTML usage
- Verify Content Security Policy (CSP) implementation
- Review form validation and data sanitization practices

### 4. Authentication & Authorization Review
- Analyze login systems for security weaknesses
- Check session management implementation
- Review password handling (hashing, storage, complexity requirements)
- Verify proper access controls and permission systems
- Check for insecure direct object references
- Analyze logout functionality and session invalidation

### 5. File Upload Security
- Review file upload mechanisms for type validation
- Check for proper file size limitations
- Verify uploaded files are stored outside web root when possible
- Analyze file extension filtering and MIME type validation
- Look for potential path traversal vulnerabilities in file operations

### 6. Server Configuration Analysis
- Review .htaccess files for security misconfigurations
- Check directory permissions and file ownership
- Analyze error handling and information disclosure
- Review HTTP security headers implementation
- Check for exposed sensitive files (config files, backups, logs)

### 7. Third-Party Dependencies
- Scan for outdated or vulnerable libraries and frameworks
- Check WordPress plugins/themes for known vulnerabilities (if applicable)
- Review JavaScript libraries for security issues
- Analyze composer/npm dependencies for known CVEs

### 8. Code Quality & Best Practices
- Review input validation and output encoding practices
- Check for proper error handling without information leakage
- Analyze logging mechanisms for security events
- Review API endpoints for proper authentication and rate limiting
- Check for hardcoded credentials or sensitive information

## Analysis Framework

### For Each File Analyzed:
1. **File Type & Purpose**: Identify what the file does
2. **Security Risk Level**: Rate as Critical/High/Medium/Low
3. **Vulnerability Description**: Detailed explanation of any issues found
4. **Attack Vector**: How the vulnerability could be exploited
5. **Impact Assessment**: Potential damage if exploited
6. **Recommended Fixes**: Specific remediation steps (for approval before implementation)

### Priority Classification:
- **CRITICAL**: Immediate security threats requiring urgent attention
- **HIGH**: Significant vulnerabilities that should be addressed quickly  
- **MEDIUM**: Important security improvements
- **LOW**: Best practice recommendations

## Specific Areas to Focus On

### Database Interactions
- Look for any dynamic SQL query construction
- Check all $_GET, $_POST, $_REQUEST usage in database contexts
- Verify proper use of PDO prepared statements or mysqli prepared statements
- Review any ORM usage for proper implementation

### File System Operations
- Check file inclusion vulnerabilities (LFI/RFI)
- Review any file_get_contents(), include(), require() usage with user input
- Analyze upload directories and file handling logic

### User Input Processing
- Review all forms and their processing scripts
- Check URL parameter handling
- Analyze cookie and session data usage
- Verify proper data type validation

## Reporting Format

### Executive Summary
- Overall security posture assessment
- Number and severity of vulnerabilities found
- Immediate action items
- Risk assessment summary

### Detailed Findings
For each vulnerability:
```
VULNERABILITY: [Name/Type]
SEVERITY: [Critical/High/Medium/Low]
FILE(S): [Affected files with line numbers]
DESCRIPTION: [Technical details]
EXPLOITATION: [How it could be attacked]
IMPACT: [Potential consequences]
RECOMMENDATION: [Specific fix - for approval]
CODE EXAMPLE: [Show vulnerable code if applicable]
```

### Malware Analysis Results
- List any suspicious files found
- Describe malicious code patterns detected
- Provide IOCs (Indicators of Compromise) if any
- Recommend cleanup procedures

### Infrastructure Recommendations
- Server hardening suggestions
- Configuration improvements
- Security header implementations
- Monitoring and logging enhancements

## Additional Checks
- Review recent file modifications (last 30 days)
- Check for any suspicious cron jobs or scheduled tasks
- Analyze web server logs for attack patterns (if accessible)
- Verify SSL/TLS configuration
- Check for any unauthorized user accounts
- Review database for suspicious entries or modifications

## Important Notes
- **DO NOT MODIFY ANY CODE** without explicit approval
- Document everything found, even minor issues
- Prioritize findings by actual security impact
- Provide clear, actionable recommendations
- Include proof-of-concept explanations where helpful
- Consider the specific technology stack in use (PHP, WordPress, etc.)

## Technology-Specific Focus
Based on the codebase, pay special attention to:
- **PHP**: Register_globals, magic_quotes, file inclusions, eval usage
- **WordPress**: Plugin vulnerabilities, theme security, wp-config.php exposure
- **JavaScript**: DOM manipulation, AJAX security, client-side validation bypass
- **Database**: MySQL injection patterns, NoSQL injection if applicable

Begin analysis now and provide a comprehensive security assessment report.