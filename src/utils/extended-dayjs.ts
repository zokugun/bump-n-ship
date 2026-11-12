const FORMAT_DEFAULT = 'YYYY-MM-DDTHH:mm:ssZ'

export function extended(_o, c, d) {
	const proto = c.prototype;
	const oldFormat = proto.format;

	proto.format = function(formatStr) {
		const str = formatStr || FORMAT_DEFAULT;

		const resultStr = str.replace(/eHY|eHM|eHW/g, (match) => {
			switch(match) {
				case 'eHY': {
					const dayOfYear = Math.round((d(this).startOf('day') - d(this).startOf('year')) / 864e5);

					return `[${dayOfYear * 24 + this.hour()}]`;
				}
				case 'eHM': {
					return `[${(this.date() - 1) * 24 + this.hour()}]`;
				}
				case 'eHW': {
					return `[${this.day() * 24 + this.hour()}]`;
				}
				default: {
					return match;
				}
			}
		});

		return oldFormat.bind(this)(resultStr);
	};
}
