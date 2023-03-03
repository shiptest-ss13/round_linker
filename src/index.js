"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = __importDefault(require("@actions/core"));
const github_1 = __importDefault(require("@actions/github"));
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const token = core_1.default.getInput("repo-token", { required: true });
            const linkUrl = core_1.default.getInput("link-url");
            const issueNumber = getIssueNumber();
            if (!issueNumber) {
                core_1.default.setFailed("Issue number retrieval failed");
                return;
            }
            const client = github_1.default.getOctokit(token);
            const issueBody = yield getIssueBody(client.rest, issueNumber);
            if (!issueBody) {
                core_1.default.setFailed("Issue body retrieval failed");
                return;
            }
            createLinks(client.rest, issueNumber, issueBody, linkUrl);
        }
        catch (e) {
            core_1.default.setFailed("Action failed.");
        }
    });
}
function getIssueNumber() {
    const issue = github_1.default.context.payload.issue;
    if (!issue) {
        return undefined;
    }
    return issue.number;
}
function getIssueBody(client, issueNumber) {
    return __awaiter(this, void 0, void 0, function* () {
        const getResponse = yield client.issues.get({
            owner: github_1.default.context.repo.owner,
            repo: github_1.default.context.repo.repo,
            issue_number: issueNumber
        });
        return getResponse.data.body;
    });
}
// Would be less intrusive but more spammy with a comment, undecided.
function createLinks(client, issueNumber, issueBody, linkUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        const re = /(\[?Round ID\]?:\s*)(\d+)/g;
        if (issueBody.match(re)) {
            const newBody = issueBody.replace(re, `$1[$2](${linkUrl !== null && linkUrl !== void 0 ? linkUrl : "https://shiptest.net/stats/rounds"}/$2)`);
            client.issues.update({
                owner: github_1.default.context.repo.owner,
                repo: github_1.default.context.repo.repo,
                issue_number: issueNumber,
                body: newBody
            });
        }
    });
}
run();
