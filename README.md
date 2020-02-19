# Multiscreen_casting-2019-2020-PnOCW-team-4
## Contributors
* CEO: Nick De Coster
* CTO: Robin Spiltijns
* TC1: Ruben de Flander
* TC2: Michiel Breens
* CodeReviewer: Jochen Knabben

## Git guidelines

### Gitflow
This project will be using gitflow to facilitate the parallel development of different features. The following link contains a guide explaining the general branch-structure of this project. All contributors should be familiar with this flow and organise their work accordingly. Ideally, this flow will be enforced in the near future. Make sure you take a good look at the illustrations in this article.

[Workflow](https://datasift.github.io/gitflow/IntroducingGitFlow.html)

### Gitkraken
Gitkraken is a GUI for git that allows you to easily execute pretty much all nessecary git commands. For simple things such as adding, committing and pulling, it might be overkill but it is great to keep a general overview of the structure of the project. It is recommended for all contributors.

[Download GitKraken](https://www.gitkraken.com/)

### Branching and merging
The following link describes how the different branches will be created and merged back into it's origin. The main benefit of this workflow seems to be that all commits that were made in a feature-branch are squashed together in one clean commit on the develop branch. We also want to avoid rewriting history. This means that all commits of a feature branch are added to the head of the develop branch. This is done by squashing and rebasing. If every commit in a certain feature branch is deemed to be possibly usefull in the future, squashing can be ommited.

[Branch and merge tutorial](https://jameschambers.co/writing/git-team-workflow-cheatsheet/)

## Lint
Some version of Lint will be implemented in the future to make sure all code is readable. Depending on whether or not TypeScript will be used, we will either use JSLint of TSLint.

## React
The front-end portion of this app uses React. This framework gives us access to a wider and more complex set of provided functions and tools. The userbase also has  a lot of support. To learn it, reading the "getting started" documentations are recommended.

[React getting started](https://reactjs.org/docs/getting-started.html)

## Communication in Slack
Slack is used for the majority of communication. It was chosen for a few reasons. First of all, it allows for separate channels to discuss different parts of the project. This allows us to keep an oversight of what is happening where and what has to happen. It also allows for easy filesharing and searching for past messages and files. Finally, it is quite customizable with apps. For example, it allows for a Github-bot to be integrated, this notifies us whenever someone makes a changen on git and allows us to comment on those changes. 

[Slack](https://slack.com/intl/en-be/help/articles/115004071768-What-is-Slack-)

## Libraries

The different libraries used on both the server and clients are everchanging. As soon as the core functionality of the application is ready, the libraries allowing for those functionalities and an explaination with why they are used, will be shown here.
