# Contributing to the Open3CL library

You want to contribute to the Open3CL library? Welcome on board, and we will help you as much as we can.

Here are the guidelines we'd like you to follow so that we can be of more help:

- [Questions and help](#question)
- [Issues and Bugs](#issue)
- [Feature Requests](#feature)
- [Submission Guidelines](#submit)
- [Coding Rules](#rules)
- [Git Commit Guidelines](#commit)

## <a id="question"></a> Questions and help

This is the Open3CL Library bug tracker, and it is used for [Issues and Bugs](#issue) and for [Feature Requests](#feature). It is **not** a help desk or a support forum.

If you have a question on using Open3CL Library, please contact us by email.

## <a id="issue"></a> Issues and Bugs

If you find a bug in the source code or a mistake in the documentation, you can help us by [submitting a ticket](https://opensource.guide/how-to-contribute/#opening-an-issue) to our [GitHub issues](https://github.com/jzck/Open3CL/issues).
Even better, you can submit a Pull Request to our [Open3CL project](https://github.com/jzck/Open3CL).

**Please see the Submission Guidelines below**.

## <a id="feature"></a> Feature Requests

You can request a new feature by submitting a ticket to our [GitHub issues](https://github.com/jzck/Open3CL/issues). If you
would like to implement a new feature then consider what kind of change it is:

- **Major Changes** that you wish to contribute to the project should be discussed first. Please open a ticket which clearly states that it is a feature request in the title and explain clearly what you want to achieve in the description, and the team will discuss with you what should be done in that ticket. You can then start working on a Pull Request.
- **Small Changes** can be proposed without any discussion. Open up a ticket which clearly states that it is a feature request in the title. Explain your change in the description, and you can propose a Pull Request straight away.

## <a id="submit"></a> Submission Guidelines

### [Submitting an Issue](https://opensource.guide/how-to-contribute/#opening-an-issue)

Before you submit your issue search the [archive](https://github.com/jzck/Open3CL/issues?utf8=%E2%9C%93&q=is%3Aissue), maybe your question was already answered.

If your issue appears to be a bug, and has not been reported, open a new issue.
Help us to maximize the effort we can spend fixing issues and adding new
features, by not reporting duplicate issues. Providing the following information will increase the
chances of your issue being dealt with quickly:

- **Overview of the issue** - if an error is being thrown a stack trace helps
- **Motivation for or Use Case** - explain why this is a bug for you
- **Reproduce the error** - an unambiguous set of steps to reproduce the error. If you have a JavaScript error, maybe you can provide a live example with
  [JSFiddle](http://jsfiddle.net/)?
- **Related issues** - has a similar issue been reported before?
- **Suggest a Fix** - if you can't fix the bug yourself, perhaps you can point to what might be
  causing the problem (line of code or commit)
- **JHipster Registry Version(s)** - is it a regression?
- **Browsers and Operating System** - is this a problem with all browsers or only IE8?

Click [here](https://github.com/jzck/Open3CL/issues/new) to open a bug issue with a pre-filled template. For feature requests and enquiries you can use templates.

Issues opened without any of these info will be **closed** without any explanation.

### [Submitting a Pull Request](https://opensource.guide/how-to-contribute/#opening-a-pull-request)

Before you submit your pull request consider the following guideline:

- Search [GitHub](https://github.com/jzck/Open3CL/pulls?utf8=%E2%9C%93&q=is%3Apr) for an open or closed Pull Request
  that relates to your submission.

## <a id="rules"></a> Coding Rules

To ensure consistency throughout the source code, keep these rules in mind as you are working:

- All features or bug fixes **must be tested** by one or more tests.
- All files must follow the [.editorconfig file](http://editorconfig.org/) located at the root of the project. Please note that generated projects use the same `.editorconfig` file, so that both the generator and the generated projects share the same configuration.
- JavaScript files **must follow** the eslint configuration defined at the project root, which is based on [JavaScript Standard Style Guide](https://standardjs.com/).

Please ensure to run `npm run qa:lint` and `npm test` on the project root before submitting a pull request. You can also run `npm run qa:lint:fix` to fix some of the lint issues automatically.

## <a id="commit"></a> Git Commit Guidelines

We have rules over how our git commit messages must be formatted. Please ensure to [squash](https://help.github.com/articles/about-git-rebase/#commands-available-while-rebasing) unnecessary commits so that your commit history is clean.

### <a id="commit-message-format"></a> Commit Message Format

Each commit message should be compliant with [commitlint](https://commitlint.js.org/) convention.
