[@zokugun/bump-n-ship](https://github.com/zokugun/bump-n-ship)
==============================================================

[![License: MIT](https://img.shields.io/badge/license-MIT-blue)](./LICENSE)
[![NPM Version](https://img.shields.io/npm/v/@zokugun/bump-n-ship?color=brightgreen)](https://www.npmjs.com/package/@zokugun/bump-n-ship)
[![NodeJS Version](https://img.shields.io/badge/node.js-%3E%3D%2018.20-green)](#requirements)
[![Modules](https://img.shields.io/badge/modules-ESM%20%7C%20CJS-green)](#requirements)
[![Ko-fi](https://img.shields.io/badge/Ko--fi-f87171?logo=kofi&logoColor=white)](https://ko-fi.com/daiyam)
[![Liberapay](https://img.shields.io/badge/Liberapay-facc15?logo=liberapay&logoColor=black)](https://liberapay.com/daiyam/donate)
[![PayPal](https://img.shields.io/badge/PayPal-5277C3?logo=paypal&logoColor=white)](https://paypal.me/daiyam99)

> Automate version bumping and release workflows. Update manifest files and publish to Git via tags or pull requests based on your project configuration.

Features
--------

- **Interactive prompts**: Choose your next version interactively through a simple CLI prompt when not in CI mode.
- **Manual overrides**: Set an exact version or specify the increment type directly via command-line flags.
- **Tagging releases**: Annotate your release commit with an automatic or custom Git tag.
- **Pull request releases**: Branch out and push changes to a dedicated PR branch for review before merging.
- **Template tokens**: Supports dynamic strings in commit messages, tag names, and PR titles using variables like `{date}`, `{index}`, and `{index}` properties.
- **Prerelease handling**: Easily manage prerelease identifiers and build metadata using customizable templates.
- **NPM hooks**: Execute your defined `preversion`, `version`, and `postversion` scripts during the release.

Installation
------------

```bash
npm add @zokugun/bump-n-ship
```

Requirements
------------

- **Node.js**: `v18.20` or higher
- **Modules**: ECMAScript Modules (`ESM`) or CommonJS (`CJS`)

Quick Start
-----------

### Example 1: Basic Version Bumping

Use the `bump` command to update the version in your `package.json` and `package-lock.json` files without creating a Git commit.

**Bumping a patch version:**
```bash
# Update the current version by one patch level (e.g., 1.0.0 -> 1.0.1)
npx bump-n-ship bump --patch
```

**Using an interactive prompt:**
If you do not specify an increment level, the tool prompts you to select the next version.
```bash
# Start the interactive selection process
npx bump-n-ship bump
```

**Dry run mode:**
Verify what the next version will be without modifying any files.
```bash
# Preview the resulting version in the console
npx bump-n-ship bump --patch --dry-run
```

---

### Example 2: Full Release to Git Tag

The `release` command automates the entire process: it bumps the version, creates a Git commit, adds a tag, and pushes changes to the remote repository.

**Customizing the commit message:**
You can specify a custom message for the release commit instead of using the default version string.
```bash
# Release with a specific commit header
npx bump-n-ship release --patch --commit 'fix: resolve memory leak in parser'
```

**Using a manual version:**
Set the project to a specific version regardless of the previous state.
```bash
# Force the version to 2.0.0 and publish as a tag
npx bump-n-ship release --set-version '2.0.0'
```

**Manually edit files like `CHANGELOG.md`:**
```bash
# After the version has been selected, pause to manually edit files like `CHANGELOG.md`
npx bump-n-ship release --all --pause
```

---

### Example 3: Release via Pull Request

For projects that require code review before merging a release, use the `--pr` flag. This creates a dedicated release branch instead of tagging the main branch directly.

**Creating a pre-release PR:**
```bash
# Bump to a pre-release version and create a release branch
npx bump-n-ship release --pre --pr
```

CLI Commands
------------

Four commands are available: `bump`, `release`, `tag`, and `get-version`.

### `bump`

Updates the project version in configured files without creating Git commits or tags.

```bash
npx bump-n-ship bump [options]
```

**Options:**

| Flag                              | Description                                                                                               |
| --------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `-b, --build <version>`           | Set build metadata                                                                                        |
| `--ci`                            | Disable interactive prompts; auto-detected in CI environments                                             |
| `-c, --current-version <version>` | Override the current version                                                                              |
| `-d, --dry-run`                   | Show what would happen without writing files                                                              |
| `--ignore-scripts`                | Skip `preversion`, `version` npm scripts                                               |
| `-i, --increment <level>`         | Specify bump type: `major`, `minor`, `patch`, `release`, `premajor`, `preminor`, `prepatch`, `prerelease` |
| `--major`                         | increment the MAJOR version.                                                                              |
| `--minor`                         | increment the MINOR version.                                                                              |
| `--patch`                         | increment the PATCH version.                                                                              |
| `-p, --pause`                     | Pause before writing files (not supported in CI)                                                          |
| `--pre [label]`                   | Set or increment pre-release label                                                                        |
| `-r, --release`                   | Bump from pre-release to full release                                                                     |
| `-s, --set-version <version>`     | Manually set an exact version                                                                             |

### `release`

Bumps the version, creates a Git commit and tag (or pull request), then pushes.

```bash
npx bump-n-ship release [options]
```

| Flag                              | Description                                                                                               |
| --------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `-b, --build <version>`           | Set build metadata                                                                                        |
| `--ci`                            | Disable interactive prompts; auto-detected in CI environments                                             |
| `-c, --current-version <version>` | Override the current version                                                                              |
| `--commit <message>`              | Custom commit message template                                                                            |
| `--confirm`                       | Prompt for confirmation before each step                                                                  |
| `--dirty`                         | Continue even with uncommitted changes                                                                    |
| `-d, --dry-run`                   | Show what would happen without writing files                                                              |
| `--ignore-scripts`                | Skip `preversion`, `version`, and `postversion` npm scripts                                               |
| `-i, --increment <level>`         | Specify bump type: `major`, `minor`, `patch`, `release`, `premajor`, `preminor`, `prepatch`, `prerelease` |
| `--major`                         | increment the MAJOR version.                                                                              |
| `--minor`                         | increment the MINOR version.                                                                              |
| `--no-verify`                     | Skip Git hooks                                                                                            |
| `--patch`                         | increment the PATCH version.                                                                              |
| `-p, --pause`                     | Pause before writing files (not supported in CI)                                                          |
| `--pr`                            | Release via a pull request.                                                                               |
| `--pre [label]`                   | Set or increment pre-release label                                                                        |
| `-r, --release`                   | Bump from pre-release to full release                                                                     |
| `-s, --set-version <version>`     | Manually set an exact version                                                                             |
| `--sign`                          | GPG-sign the commit and tag                                                                               |
| `--tag <name>`                    | Custom tag name template                                                                                  |


### `tag`

Commits and tags the current version without bumping.

```bash
npx bump-n-ship tag [options]
```

| Flag                 | Description                                                   |
| -------------------- | ------------------------------------------------------------- |
| `--all`              | Stage all changes instead of only version files               |
| `--ci`               | Disable interactive prompts; auto-detected in CI environments |
| `--commit <message>` | Custom commit message template                                |
| `--confirm`          | Prompt for confirmation before each step                      |
| `--dirty`            | Continue even with uncommitted changes                        |
| `-d, --dry-run`      | Show what would happen without writing files                  |
| `--ignore-scripts`   | Skip `postversion` npm scripts                                |
| `--no-verify`        | Skip Git hooks                                                |
| `-p, --pause`        | Pause before writing files (not supported in CI)              |
| `--sign`             | GPG-sign the commit and tag                                   |
| `--tag <name>`       | Custom tag name template                                      |

### `get-version`

Prints the current version from `package.json`.

```bash
npx bump-n-ship get-version
```

No options.

Configuration
-------------

The package reads `.bumpnshiprc{.json,.yaml,.yml}` from the project root.

**Example:**

```yaml
bump:
  preRelease: 'beta.{index:1}'

publish:
  remote: origin
  sign: false
  dirty: false
  all: false
  verify: true
  tag:
    name: 'v{version}'
    message: '{version}'
  commit:
    header: 'chore: release {version}'
  pullRequest:
    branch: 'release/{tag}'
    title: 'chore: release {tag}'
    body: '{oldVersion} → {version}'
```

Template Variables
------------------

See [Template Variables](./docs/templates.md) for available placeholders and where they can be used.

Contributions
-------------

Contributions are most welcome. Please:

- Open issues and feature requests under the repository discussions.
- Follow the [`CONTRIBUTING.md`](./CONTRIBUTING.md).

Donations
---------

Support this project by becoming a financial contributor.

<table>
   <tr>
      <td><img src="https://raw.githubusercontent.com/daiyam/assets/master/icons/256/funding_kofi.png" alt="Ko-fi" width="80px" height="80px"></td>
      <td><a href="https://ko-fi.com/daiyam" target="_blank">ko-fi.com/daiyam</a></td>
   </tr>
   <tr>
      <td><img src="https://raw.githubusercontent.com/daiyam/assets/master/icons/256/funding_liberapay.png" alt="Liberapay" width="80px" height="80px"></td>
      <td><a href="https://liberapay.com/daiyam/donate" target="_blank">liberapay.com/daiyam/donate</a></td>
   </tr>
   <tr>
      <td><img src="https://raw.githubusercontent.com/daiyam/assets/master/icons/256/funding_paypal.png" alt="PayPal" width="80px" height="80px"></td>
      <td><a href="https://paypal.me/daiyam99" target="_blank">paypal.me/daiyam99</a></td>
   </tr>
</table>

License
-------

Copyright &copy; 2026-present Baptiste Augrain

Licensed under the [MIT license](https://opensource.org/licenses/MIT).
