export function removeUndefined<T extends object>(obj?: T): Partial<T> | undefined {
	if(!obj) {
		return undefined;
	}

	return Object.fromEntries(Object.entries(obj).filter(([_, value]) => value !== undefined)) as Partial<T>;
}
