// import { getAssetUrlsByMetaUrl } from '@tldraw/assets/urls';
import { MarkdownRenderChild, TFile } from "obsidian";
import * as React from "react";
import { Root, createRoot } from "react-dom/client";
import { InkFileData, stringifyPageData } from "src/utils/page-file";
import { DrawingEmbedData, applyCommonAncestorStyling } from "src/utils/embed";
import InkPlugin from "src/main";
import DrawingEmbed from "src/tldraw/drawing/drawing-embed";
import { DRAW_EMBED_KEY } from "src/constants";
import { Provider } from "react-redux";
import { store } from "src/logic/stores";

////////
////////

export function registerDrawingEmbed(plugin: InkPlugin) {
	plugin.registerMarkdownCodeBlockProcessor(
		DRAW_EMBED_KEY,
		(source, el, ctx) => {
			const embedData = JSON.parse(source) as DrawingEmbedData;
			if(embedData.filepath) {
				ctx.addChild(new DrawingEmbedWidget(el, plugin, embedData));
			}
		}
	);
}

class DrawingEmbedWidget extends MarkdownRenderChild {
	el: HTMLElement;
	plugin: InkPlugin;
	embedData: DrawingEmbedData;
	root: Root;
	fileRef: TFile | null;

	constructor(
		el: HTMLElement,
		plugin: InkPlugin,
		embedData: DrawingEmbedData,
	) {
		super(el);
		this.el = el;
		this.plugin = plugin;
		this.embedData = embedData;
	}

	async onload() {
		const v = this.plugin.app.vault;
		this.fileRef = v.getAbstractFileByPath(this.embedData.filepath) as TFile;
		
		if( !this.fileRef || !(this.fileRef instanceof TFile) ) {
			this.el.createEl('p').textContent = 'Ink drawing file not found.';
			return;
		}

		const pageDataStr = await v.read(this.fileRef);
		const pageData = JSON.parse(pageDataStr) as InkFileData;

		this.root = createRoot(this.el);
		this.root.render(
			<Provider store={store}>
				<DrawingEmbed
					plugin = {this.plugin}
					fileRef = {this.fileRef}
					pageData = {pageData}
					save = {this.save}
				/>
			</Provider>
        );

		applyCommonAncestorStyling(this.el)
	}

	async onunload() {
		this.root?.unmount();
	}

	// Helper functions
	///////////////////

	save = async (pageData: InkFileData) => {
		if(!this.fileRef) return;
		const pageDataStr = stringifyPageData(pageData);
		await this.plugin.app.vault.modify(this.fileRef, pageDataStr);
	}

}