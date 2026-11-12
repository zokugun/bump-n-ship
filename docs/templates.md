# Template Variables

Templates use braces around a variable name. Some variables take a format or property after a colon, for example `{date:YYYYMMDD}` or `{git:branch}`. Text that is not a recognized variable is left as written.

## Where Templates Are Used

| Configuration value                                                                   | Template kind          | Available variables                |
| ------------------------------------------------------------------------------------- | ---------------------- | ---------------------------------- |
| `bump.build`, `--build`                                                               | Build metadata         | `date`, `git`                      |
| `bump.preRelease`, `--pre`                                                            | Prerelease identifiers | `date`, `git`, `index`             |
| `publish.commit.header`, `publish.commit.body`, `publish.commit.footer`, `--commit`   | Commit message         | All message variables below        |
| `publish.tag.name`, `--tag`                                                           | Tag name               | All message variables except `tag` |
| `publish.tag.message`                                                                 | Tag annotation         | All message variables below        |
| `publish.pullRequest.branch`, `publish.pullRequest.title`, `publish.pullRequest.body` | Pull request           | All message variables below        |

## Date

`{date}` inserts the current date and time in `YYYY-MM-DDTHH:mm:ssZ` format. Supply a Day.js format after the colon to choose another representation:

```yaml
bump:
  build: '{date:YYYYMMDD}'
  preRelease: 'beta.{date:YYYYMMDD}'
```

The additional formats `{date:eHY}`, `{date:eHM}`, and `{date:eHW}` produce numeric hour counters within the year, month, and week respectively.

## Git

Git variables require a property name. The current repository's branch and `git describe --long --tags` values are loaded when a Git variable is used.

| Variable         | Value                                             |
| ---------------- | ------------------------------------------------- |
| `{git:branch}`   | Current branch name                               |
| `{git:commitId}` | Abbreviated commit identifier from `git describe` |
| `{git:distance}` | Number of commits since the described tag         |

Git variables work in build metadata, prerelease identifiers, and publish message templates. They require a Git repository with a describable tag for `git describe`.

## Prerelease Index

`{index}` is only available in `bump.preRelease`. It inserts `0` when the template does not specify a seed. `{index:N}` inserts the numeric seed `N`.

When the same prerelease identifier already exists at that position, and earlier identifiers in the template still match, the existing number is incremented. Otherwise the seed is used. Keep the index as a complete dot-separated identifier, for example:

```yaml
bump:
  preRelease: 'beta.{index:1}'
```

This starts at `beta.1`, then increments to `beta.2` on the next compatible prerelease bump.

## Version and Publish Variables

These variables are available in commit messages, tag messages, and pull request branch/title/body templates. They are also available while constructing `publish.tag.name`, except for `{tag}` itself.

| Variable        | Value                                                  |
| --------------- | ------------------------------------------------------ |
| `{version}`     | New version                                            |
| `{oldVersion}`  | Version before the bump                                |
| `{major}`       | New major version number                               |
| `{minor}`       | New minor version number                               |
| `{patch}`       | New patch version number                               |
| `{releaseType}` | Selected increment type, such as `patch` or `preminor` |
| `{tag}`         | Resolved tag name; not available in `publish.tag.name` |

The tag name is resolved before the other publish templates, so it can be used in commit/tag messages and pull request fields. For example:

```yaml
publish:
  tag:
    name: 'v{version}'
    message: 'Release {tag}'
  commit:
    header: 'chore: release {version}'
  pullRequest:
    branch: 'release/{tag}'
    title: 'Release {tag}'
```

Recognized version variables with no value in the current operation are replaced with an empty string. A variable that is not supported by a template kind, such as `{index}` in a commit message, is left unchanged.
