import { Editor, SerializedStore, Store, StoreSnapshot, TLGeoShape, TLRecord, TLShapePartial, Tldraw, createShapeId, createTLStore, parseTldrawJsonFile } from "@tldraw/tldraw";
// import { getAssetUrlsByMetaUrl } from '@tldraw/assets/urls';
import { MarkdownRenderChild, MarkdownViewModeType, Plugin, TAbstractFile, TFile, debounce, } from "obsidian";
import * as React from "react";
import { Root, createRoot } from "react-dom/client";
import { PageData, buildPageFile } from "src/utils/page-file";
import { HandwrittenEmbedData } from "src/utils/embed";
import { HandwrittenEmbed } from "src/tldraw/handwritten-embed";

////////
////////


export function registerHandwritingEmbed(plugin: Plugin) {
	plugin.registerMarkdownCodeBlockProcessor(
		'handwritten-ink',
		(source, el, ctx) => {
			const embedJson = JSON.parse(source) as HandwrittenEmbedData;
			if(embedJson.filepath) {
				ctx.addChild(new HandwrittenEmbedWidget(el, plugin, embedJson.filepath));
			}
		}
	);
}

class HandwrittenEmbedWidget extends MarkdownRenderChild {
	el: HTMLElement;
	plugin: Plugin;
	filepath: string;
	root: Root;
	fileRef: TFile | null;

	constructor(
		el: HTMLElement,
		plugin: Plugin,
		filepath: string,
	) {
		super(el);
		this.el = el;
		this.plugin = plugin;
		this.filepath = filepath;
	}


	async onload() {
		const v = this.plugin.app.vault;
		this.fileRef = v.getAbstractFileByPath(this.filepath) as TFile;
		
		console.log('this.fileRef', this.fileRef);
		if( !this.fileRef || !(this.fileRef instanceof TFile) ) {
			// TODO: This is added, but is not visible
			const containerEl = this.el.createDiv();
			containerEl.createEl('p', 'Handwriting ink file not found.')
			return;
		}

		const fileContents = await v.cachedRead(this.fileRef as TFile);	// REVIEW: This shouldn't be cached read
		const pageData = JSON.parse(fileContents) as PageData;

		this.root = createRoot(this.el);
		this.root.render(
            <HandwrittenEmbed
                existingData = {pageData.tldraw}
                filepath = {this.fileRef.path}
                save = {this.saveLinkedFile}
			/>
        );
	}

	async onunload() {
		this.root.unmount();
	}

	// Helper functions
	///////////////////

	saveLinkedFile = async (tldrawData: SerializedStore<TLRecord>) => {
		if(!this.fileRef) return;
		const fileContents = buildPageFile(tldrawData);
		await this.plugin.app.vault.modify(this.fileRef, fileContents);
		console.log('...Saved');
	}

}