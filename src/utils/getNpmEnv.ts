import process from 'node:process';

const REMOVE_VARS = [
	'npm_config_npm_globalconfig',
	'npm_config_verify_deps_before_run',
	'npm_config_overrides',
	'npm_config__jsr_registry'
];

export function getNpmEnv(): typeof process.env {
	const env = { ...process.env };

	for(const key of Object.keys(env)) {
		if(REMOVE_VARS.includes(key.toLowerCase())) {
			delete env[key];
		}
	}

	return env;
}
