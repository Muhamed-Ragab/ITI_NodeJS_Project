export class CdnProvider {
	upload(_source, _options = {}) {
		throw new Error("Not implemented");
	}

	getUploadRequestPayload(_options = {}) {
		throw new Error("Not implemented");
	}

	async uploadMany(sources = [], options = {}) {
		const uploads = sources.map((source) => this.upload(source, options));
		return await Promise.all(uploads);
	}
}
