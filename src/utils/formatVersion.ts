import { SemVer } from 'verkit';

export function formatVersion(version: SemVer): string {
  const base = `${version.major}.${version.minor}.${version.patch}`
  const comparable = version.prerelease?.length ? `${base}-${version.prerelease.join('.')}` : base

  return version.build?.length ? `${comparable}+${version.build.join('.')}` : comparable
}
