import { Octokit } from '@octokit/rest';
import fs from 'fs';

function getJsonData() {
    const data = fs.readFileSync('./token.json', 'utf-8');
    return JSON.parse(data);
}

const data = getJsonData();
const token = data['user-profile-token'];
const username = data['username'];

const octokit = new Octokit({
    auth: token
});

async function getFollowers(count) {
    let data = [];
    try {
        let page = 1;
        while (page <= Math.ceil(count / 30)) {
            const response = await octokit.request(`GET /users/${username}/followers?page=${page}`, {
                username: username,
                headers: {
                  'X-GitHub-Api-Version': '2022-11-28'
                }
            });
            data.push(...response.data);
            page++;
        }
    } catch (error) {
    }
    return data;
}

async function getFollowing(count) {
    let data = [];
    try {
        let page = 1;
        while (page <= Math.ceil(count / 30)) {
            const response = await octokit.request(`GET /users/${username}/following?page=${page}`, {
                username: username,
                headers: {
                  'X-GitHub-Api-Version': '2022-11-28'
                }
            });
            data.push(...response.data);
            page++;
        }
    } catch (error) {
    }
    return data;
}

async function getUserStats() {
    try {
        const response = await octokit.request(`GET /users/${username}`, {
            username: username,
            headers: {
              'X-GitHub-Api-Version': '2022-11-28'
            }
        });
        return await response.data;
    } catch (error) {
    }

}

const stats = await getUserStats();
const followers = await getFollowers(stats['followers']);
const following = await getFollowing(stats['following']);

const followersNames = followers.map(user => user.login);
const followingNames = following.map(user => user.login);

const followersSet = new Set(followersNames);
const followingSet = new Set(followingNames);

const notFollowUs = followingNames.filter(user => !followersSet.has(user));
const notFollowThem = followersNames.filter(user => !followingSet.has(user));

console.log(`You are not following ${notFollowThem.length} user(s):` + notFollowThem);
console.log();
console.log(`There are ${notFollowUs.length} user(s) who do not follow you: ` + notFollowUs);
