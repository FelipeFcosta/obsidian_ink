// import { getAssetUrlsByMetaUrl } from '@tldraw/assets/urls';
import { MarkdownRenderChild, MarkdownView, TFile } from "obsidian";
import * as React from "react";
import { Root, createRoot } from "react-dom/client";
import { InkFileData, stringifyPageData } from "src/utils/page-file";
import { WritingEmbedData as WritingEmbedData, applyCommonAncestorStyling } from "src/utils/embed";
import InkPlugin from "src/main";
import WritingEmbed from "src/tldraw/writing/writing-embed";
import { WRITE_EMBED_KEY } from "src/constants";
import { Provider } from "react-redux";
import { store } from "src/logic/stores";

////////
////////

export function registerWritingEmbed(plugin: InkPlugin) {
	plugin.registerMarkdownCodeBlockProcessor(
		WRITE_EMBED_KEY,
		(source, el, ctx) => {
			const embedData = JSON.parse(source) as WritingEmbedData;
			if(embedData.filepath) {
				ctx.addChild(new WritingEmbedWidget(el, plugin, embedData));
			}
			
			// TODO: Editor test for deletion
			// const sectionInfo = ctx.getSectionInfo(el);
			// if(sectionInfo) {
			// 	const view = plugin.app.workspace.getActiveViewOfType(MarkdownView);
			// 	if (view) {
			// 		const editor = view.editor;
			// 		// TODO: I think this offset is index offset, not line offset
			// 		editor.replaceRange('', editor.offsetToPos(sectionInfo.lineStart), editor.offsetToPos(sectionInfo.lineEnd))
	
			// 	}
			// }
		}
	);
}

class WritingEmbedWidget extends MarkdownRenderChild {
	el: HTMLElement;
	plugin: InkPlugin;
	embedData: WritingEmbedData;
	root: Root;
	fileRef: TFile | null;
	
	constructor(
		el: HTMLElement,
		plugin: InkPlugin,
		embedData: WritingEmbedData,
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
			this.el.createEl('p').textContent = 'Ink writing file not found: ' + this.embedData.filepath;
			return;
		}

		const pageDataStr = await v.read(this.fileRef);
		const pageData = JSON.parse(pageDataStr) as InkFileData;

		if(!this.root) this.root = createRoot(this.el);

		this.root.render(
			<Provider store={store}>
				<WritingEmbed
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