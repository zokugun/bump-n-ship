import { vitest } from '@zokugun/eslint-config-test';

export default configure([
	// configdotts/Ignore rules
	ignores('test/fixtures/**'),

	// configdotts/Testing rules
	vitest(),
]);
