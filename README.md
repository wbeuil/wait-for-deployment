# Wait For GitHub Deployment

Wait for a GitHub deployment to complete and get its url on push and pull request. Only for Vercel based website. It's gonna by default take the `Preview` deployment when it's a pull request and the `Production` deployment when it's a push.

## Inputs

### `token`

**Required** This is your GitHub personal access token. Accessible via `${{ github.token }}` or `${{ secrets.GITHUB_TOKEN }}`.

### `timeout`

Maximum time in seconds to wait for the deployment. Default `120` seconds.

## Outputs

### `url`

The target URL of the deployment.

## Example usage

```yml
name: Test Workflow

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: wbeuil/wait-for-deployment@v1
        id: deployment
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
      - run: echo "Deployed to ${{ steps.deployment.outputs.url }}"
```
