const core = require("@actions/core");
const github = require("@actions/github");

const sleep = (seconds) =>
  new Promise((resolve) => setTimeout(resolve, seconds * 1000));

async function waitForDeployment() {
  const { eventName, payload, repo } = github.context;
  const token = core.getInput("token");
  const timeout = core.getInput("timeout") * 1000;
  const endTime = new Date().getTime() + timeout;

  let params = {
    ...repo,
  };

  core.debug(`eventName? ${eventName}`);

  if (eventName === "pull_request") {
    params = {
      ...params,
      sha: payload.pull_request.head.sha,
      environment: "Preview",
    };
  } else if (eventName === "push") {
    params = {
      ...params,
      sha: payload.head_commit.id,
      environment: "Production",
    };
  } else {
    throw new Error(`Unhandled event: ${eventName}`);
  }

  let attempt = 1;

  const octokit = github.getOctokit(token);

  while (new Date().getTime() < endTime) {
    try {
      const { data: deployments } = await octokit.repos.listDeployments(params);

      if (deployments.length > 1) {
        throw new Error(
          `There should be only one deployment for ${params.sha} but found ${deployments.length} instead.`
        );
      }

      for (const deployment of deployments) {
        const { data: statuses } = await octokit.repos.listDeploymentStatuses({
          ...repo,
          deployment_id: deployment.id,
        });

        const [success] = statuses.filter(
          (status) => status.state === "success"
        );

        if (success) {
          return success.target_url;
        }
      }
    } catch (error) {
      throw error;
    }

    console.log(`Url unavailable. Attempt ${attempt++}.`);

    await sleep(2);
  }

  throw new Error(
    `Timeout reached before deployment for ${params.sha} was found.`
  );
}

(async () => {
  try {
    const url = await waitForDeployment();
    core.setOutput("url", url);
  } catch (err) {
    core.setFailed(err.message);
  }
})();
