# Documentation examples and snippets

## Requirement change notice example

```markdown
### Requirement change notice
- Requirement: Login flow
- Previous version: username + password
- New version: mobile number + verification code
- Reason: reduce login friction
- Impacted areas: app UI, auth service, SMS service, test cases
- Priority: high
- Release impact: requires schedule reassessment
```

## Development FAQ example

```markdown
## FAQ

### Q: Why does local startup fail on database connection?
A: Check `.env`, local database port, and whether migrations were run.

### Q: Which module owns payment callbacks?
A: `payment-service/callback` handles third-party callback verification and status sync.
```

## Project architecture explanation pattern

Use this sequence when explaining architecture:
1. overall style such as monolith or microservices
2. key components
3. request or data flow
4. major dependencies such as cache, queue, search, third-party services
5. key constraints or risks
