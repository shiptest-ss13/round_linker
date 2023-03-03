import core from '@actions/core';
import github from '@actions/github';
import { RestEndpointMethods } from '@octokit/plugin-rest-endpoint-methods/dist-types/generated/method-types';

async function run() {
  try {
    const token = core.getInput("repo-token", { required: true });
    const linkUrl = core.getInput("link-url");
    const issueNumber = getIssueNumber();
    if (!issueNumber) {
      core.setFailed("Issue number retrieval failed");
      return;
    }
    const client = github.getOctokit(token);
    const issueBody = await getIssueBody(client.rest, issueNumber)
    if (!issueBody) {
      core.setFailed("Issue body retrieval failed");
      return;
    }
    createLinks(client.rest, issueNumber, issueBody, linkUrl)
  }
  catch (e) {
    core.setFailed("Action failed.");
  }

}

function getIssueNumber() {
  const issue = github.context.payload.issue;
  if (!issue) {
    return undefined;
  }
  return issue.number;
}

async function getIssueBody(client: RestEndpointMethods, issueNumber: number) {
  const getResponse = await client.issues.get({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    issue_number: issueNumber
  });
  return getResponse.data.body
}

// Would be less intrusive but more spammy with a comment, undecided.
async function createLinks(client: RestEndpointMethods, issueNumber: number, issueBody: string, linkUrl?: string) {
  const re = /(\[?Round ID\]?:\s*)(\d+)/g
  if(issueBody.match(re))
  {
    const newBody = issueBody.replace(re, `$1[$2](${linkUrl ?? "https://shiptest.net/stats/rounds"}/$2)`);

    client.issues.update({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      issue_number: issueNumber,
      body: newBody
    });
  }
}

run();
