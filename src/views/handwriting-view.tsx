import { SerializedStore, TLRecord } from "@tldraw/tldraw";
import { TextFileView, WorkspaceLeaf } from "obsidian";
import * as React from "react";
import { Root, createRoot } from "react-dom/client";
import HandwritePlugin from "src/main";
import TldrawPageEditor from 'src/tldraw/tldraw-page-editor';
import { PageData, buildPageFile } from "src/utils/page-file";

////////
////////

export const HANDWRITING_VIEW_TYPE = "handwriting-view";
export enum ViewPosition {
    replacement,
    tab,
    verticalSplit,
    horizontalSplit
}



export function registerHandwritingView (plugin: HandwritePlugin) {
    plugin.registerView(
        HANDWRITING_VIEW_TYPE,
        (leaf) => new HandwritingView(leaf, this)
    );
    plugin.registerExtensions(['byhand'], HANDWRITING_VIEW_TYPE);
}


export class HandwritingView extends TextFileView {
    root: null | Root;
    plugin: HandwritePlugin;
    liveTldrawData: SerializedStore<TLRecord>;

    constructor(leaf: WorkspaceLeaf, plugin: HandwritePlugin) {
        super(leaf);
        this.plugin = plugin;
    }

    saveFile(contents: string) {
        // console.log('this.data', this.data);
        // this.requestSave();
        // this.save();
        // this.data = contents;

        // this.liveTldrawData = JSON.parse(contents) as SerializedStore<TLRecord>;
        // console.log('this.liveTldrawData', this.liveTldrawData);
    }

    getViewType() {
        return HANDWRITING_VIEW_TYPE;
    }

    getDisplayText() {
        return this.file?.basename || "Handwritten note";
    }
    
    // This provides the data from the file for placing into the view (Called when file is opening)
    async setViewData(fileContents: string, clear: boolean): Promise<void> {
        const pageData = JSON.parse(fileContents) as PageData;
        this.liveTldrawData = pageData.tldraw;

        const viewContent = this.containerEl.children[1];
        viewContent.setAttr('style', 'padding: 0;');
		
        // If the view hasn't been initiated, create the React root // REVIEW: This seems to create a too many renders issue
        // if(!this.root) this.root = createRoot(viewContent);
        this.root = createRoot(viewContent);

		this.root.render(
            <TldrawPageEditor
                existingData = {this.liveTldrawData}
                uid = {this.file.path}
                save = {this.saveFile}
			/>
        );
    }
    
    // This allows you to return the data you want obsidian to save (Called when file is closing)
    getViewData(): string {
        console.log('running GET VIEW DATA');
        const tldrawData = this.liveTldrawData;
        const fileContents = buildPageFile(tldrawData as SerializedStore<TLRecord>)
        return fileContents;
    }

    // This allows you to clear the view before a new file is opened of of the same type in the same leaf?????
    clear(): void {
        console.log('clear being called');
    }
    
    // onPaneMenu()

    // onResize()

}









// export async function activateHandwritingView(plugin: HandwritePlugin, position: ViewPosition = ViewPosition.replacement) {
// 	switch(position) {
//         case ViewPosition.replacement:      activateReplacementView(plugin); break;
//         case ViewPosition.tab:              activateTabView(plugin); break;
//         case ViewPosition.verticalSplit:    activateSplitView(plugin, 'horizontal'); break;
//         case ViewPosition.horizontalSplit:  activateSplitView(plugin, 'vertical'); break;
//         default: activateReplacementView(plugin); break;
//     }
//     console.log('DONE')
//     console.log(position)
// }

// async function activateReplacementView(plugin: HandwritePlugin) {
//     let { workspace }  = plugin.app;
// 	let leaf = workspace.getLeaf();
//     await leaf.setViewState({ type: HANDWRITING_VIEW_TYPE, active: true });
//     workspace.revealLeaf(leaf);
// }
// async function activateTabView(plugin: HandwritePlugin) {
//     let { workspace }  = plugin.app;
	
//     let leaf: WorkspaceLeaf | null = null;
// 	let leaves = workspace.getLeavesOfType(HANDWRITING_VIEW_TYPE);

//     // This code finds if it alread existing in a tab and uses that first.
// 	// if (leaves.length > 0) {
// 	// 	// A leaf with our view already exists, use that
// 	// 	leaf = leaves[0];
// 	// } else {
// 		// Our view could not be found in the workspace
// 		leaf = workspace.getLeaf(true);
// 		await leaf.setViewState({ type: HANDWRITING_VIEW_TYPE, active: true });
// 	// }

//     workspace.revealLeaf(leaf);
// }
// async function activateSplitView(plugin: HandwritePlugin, direction: 'horizontal' | 'vertical') {
//     let { workspace }  = plugin.app;
    
//     let leaf: null | WorkspaceLeaf;
//     direction == 'vertical' ?   leaf = workspace.getLeaf('split', 'vertical') : 
//                                 leaf = workspace.getLeaf('split', 'horizontal');

//     await leaf.setViewState({ type: HANDWRITING_VIEW_TYPE, active: true });
//     workspace.revealLeaf(leaf);
// }
