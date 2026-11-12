export enum Mode {
	Nil			= 0,
    Auto		= 1 << 0,
    Major		= 1 << 1,
    Minor		= 1 << 2,
	Patch		= 1 << 3,
	PreRelease	= 1 << 4,
	Prompt		= 1 << 5,
	// Release		= 1 << 6,
	Version		= 1 << 6,
};
