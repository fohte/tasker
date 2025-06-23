# Deployment Verification Checklist

This checklist helps ensure successful deployment and operation of the tasker application on Cloudflare Workers.

## Pre-Deployment Checklist

- [ ] All tests pass locally (`bun test`)
- [ ] Linting passes (`bun run lint`)
- [ ] Build completes successfully (`bun run build`)
- [ ] D1 database is created and configured
- [ ] GitHub Secrets are properly set
- [ ] `wrangler.toml` has correct database ID

## Deployment Process

### 1. Initial Setup Verification

```bash
# Check Cloudflare authentication
npx wrangler whoami

# Verify D1 database exists
npx wrangler d1 list

# Test build process
bun run opennextjs-cloudflare build
```

### 2. Deploy to Preview

```bash
# Deploy to preview environment
bun run deploy:preview

# Check deployment status
npx wrangler deployments list
```

### 3. Functional Testing

- [ ] **Homepage loads**: Visit `https://tasker-preview.workers.dev`
- [ ] **API endpoint works**: Check `/api/graphql` endpoint
- [ ] **Database connectivity**: Create/read tasks
- [ ] **Static assets load**: CSS, JavaScript, images
- [ ] **Error pages work**: Test 404 page

### 4. Production Deployment

```bash
# Deploy to production
bun run deploy:production
```

## Post-Deployment Verification

### Application Health Checks

1. **Basic Connectivity**

```bash
curl -I https://tasker.workers.dev
# Should return 200 OK
```

2. **GraphQL API**

```bash
curl -X POST https://tasker.workers.dev/api/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ __typename }"}'
# Should return GraphQL response
```

3. **Database Operations**

- Create a new task
- List existing tasks
- Update a task
- Delete a task

### Monitoring

1. **Cloudflare Dashboard**

- Check Workers analytics
- Monitor error rates
- Review performance metrics

2. **Logs**

```bash
# View real-time logs
npx wrangler tail tasker-production
```

3. **D1 Database**

- Check database metrics in Cloudflare dashboard
- Verify data persistence

## Rollback Procedure

If issues are detected:

1. **Immediate Rollback**

```bash
# List recent deployments
npx wrangler deployments list

# Rollback to previous version
npx wrangler rollback [deployment-id]
```

2. **Investigate Issues**

- Check error logs
- Review recent commits
- Test locally with same configuration

## Common Issues and Solutions

### Build Failures

- **Bundle size too large**: Optimize imports, use dynamic imports
- **Missing dependencies**: Check `package.json` and run `bun install`
- **TypeScript errors**: Run `bun run test:type` to identify issues

### Runtime Errors

- **Database connection failed**: Verify D1 binding in `wrangler.toml`
- **Environment variable missing**: Check GitHub Secrets and `wrangler.toml`
- **Route not found**: Ensure all routes work with edge runtime

### Performance Issues

- **Slow response times**: Check bundle size and optimize
- **High error rate**: Review logs for common errors
- **Database timeouts**: Optimize queries, add indexes

## Success Criteria

Deployment is considered successful when:

- ✅ All health checks pass
- ✅ No errors in logs for 5 minutes
- ✅ Response times < 500ms for main pages
- ✅ All CRUD operations work correctly
- ✅ No JavaScript console errors

## Contacts

- **Cloudflare Support**: [support.cloudflare.com](https://support.cloudflare.com)
- **Status Page**: [cloudflarestatus.com](https://www.cloudflarestatus.com)
