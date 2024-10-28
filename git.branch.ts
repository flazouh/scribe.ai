import { exec } from "node:child_process";
import { promisify } from "node:util";
import OpenAI from "openai";
import * as dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

const execAsync = promisify(exec);

// Initialize OpenAI client
const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY, // Make sure to set this environment variable
});

async function getGitHubUsername(): Promise<string> {
	try {
		const { stdout } = await execAsync("git config user.name");
		return stdout.trim().toLowerCase().replace(/\s+/g, "-");
	} catch (error) {
		console.error("Error getting GitHub username:", error);
		return "unknown-user";
	}
}

async function generateBranchName(diff: string, username: string): Promise<string> {
	try {
		const response = await openai.chat.completions.create({
			model: "gpt-4o-mini",
			messages: [
				{
					role: "system",
					content:
						"You are a helpful assistant that generates git branch names based on code diffs using the 'gitbranch' format.",
				},
				{
					role: "user",
					content: `Based on this git diff, generate a branch name using a prefix, exemple: "feature/" as a JSON object { "branchName": "<prefix>/<branch-name>" }:

Git diff:
${diff}`,
				},
			],
			response_format: { type: "json_object" },
			max_tokens: 50,
		});

		const result = JSON.parse(response.choices[0]?.message.content?.trim() || "") as {
			branchName: string;
		};
		console.log("Branch name:", result);
		return `${username}/${result.branchName.toLowerCase().replace(/\s+/g, "-")}`;
	} catch (error) {
		console.error("Error generating branch name:", error);
		throw error;
	}
}

async function fastGit(targetBranch = "staging") {
	try {
		// Get the git diff
		const { stdout: diff } = await execAsync("git diff");

		console.log("Diff:", diff);

			// Get GitHub username
			const username = await getGitHubUsername();

			// Generate branch name based on the diff and username
			const branchName = await generateBranchName(diff.slice(0, 8000), username);

			// Execute git commands
			await execAsync(`git checkout ${targetBranch}`);
			await execAsync(`git checkout -b ${branchName}`);
			console.log(`Successfully created branch: ${branchName} based on ${targetBranch}`);
	} catch (error) {
		console.error("Error executing git commands:", error);
	}
}

// Update the function call to accept a command-line argument
const targetBranch = process.argv[2];
fastGit(targetBranch);
