import { Editor, SerializedStore, TLRecord, Tldraw } from "@tldraw/tldraw";
import * as React from "react";
import { useRef, useState } from "react";
import TldrawHandwrittenEditor from "./tldraw-handwritten-editor";

///////
///////

enum tool {
	nothing,
	select = 'select',
	draw = 'draw',
	eraser = 'eraser',
}

export function HandwrittenEmbed (props: {
	existingData: SerializedStore<TLRecord>,
	filepath: string,
	save: Function,
}) {
	// const assetUrls = getAssetUrlsByMetaUrl();
	const embedContainerRef = useRef<HTMLDivElement>(null);
	const editorRef = useRef<Editor|null>(null);
	const [activeTool, setActiveTool] = useState<tool>(tool.nothing);

	const handleMount = (editor: Editor) => {
		// editorRef.current = editor;
		// zoomToPageWidth(editor);
		// fitEmbedToContent(editor);
		// activateDrawTool();
		// initListeners(editor);
		// applyPostMountSettings(editor);
	}

	return <>
		{/* <div className = 'ink_embed-controls'> */}
			{/* <button
				onClick = {activateDrawTool}
				disabled = {activeTool===tool.draw}
				>
				Write
			</button>
			<button
				onClick = {activateEraserTool}
				disabled = {activeTool===tool.eraser}
				>
				Eraser
			</button>
			<button
				onClick = {activateSelectTool}
				disabled = {activeTool===tool.select}
				>
				Select
			</button>
		</div> */}
		<div
			ref = {embedContainerRef}
			style = {{
				height: '400px',
			}}
		>
			{/* <Tldraw
				// TODO: Try converting snapshot into store: https://tldraw.dev/docs/persistence#The-store-prop
				snapshot = {props.existingData}	// NOTE: Check what's causing this snapshot error??
				// persistenceKey = {props.filepath}
				onMount = {handleMount}
				// assetUrls = {assetUrls}
				hideUi = {true}
			/> */}
			<TldrawHandwrittenEditor
                existingData = {props.existingData}
                filepath = {props.filepath}
                save = {props.save}
			/>
		</div>
	</>;

	// Helper functions
	///////////////////

	function applyPostMountSettings(editor: Editor) {
		editor.updateInstanceState({
			isDebugMode: false,
			// isGridMode: false,
			canMoveCamera: false,
		})
	}

	function zoomToPageWidth(editor: Editor) {
		const pageBounds = editor.currentPageBounds;
		if(pageBounds) {
			// REVIEW: This manipulations are a hack because I don't know how to get it to zoom exactly to the bounds rather than adding buffer
			pageBounds.x /= 3.5;
			pageBounds.y *= 2.3;
			pageBounds.w /= 2;
			pageBounds.h /= 2;
			editor.zoomToBounds(pageBounds);
		} else {
			console.log('zooming to FIT')
			editor.zoomToFit();
		}
	}

	function fitEmbedToContent(editor: Editor) {
		const embedBounds = editor.viewportScreenBounds;
		const contentBounds = editor.currentPageBounds;
		if(contentBounds) {
			const contentRatio = contentBounds.w / contentBounds.h
			const embedHeight = embedBounds.w / contentRatio;
			if(embedContainerRef.current) {
				embedContainerRef.current.style.height = embedHeight + 'px';
			}
		}
	}

	function initListeners(editor: Editor) {
		editor.store.listen((entry) => {
			// REVIEW: Mouse moves fire this too, so it would be good to filter this to only save if it's a save-worthy change
			fitEmbedToContent(editor);
			const contents = editor.store.getSnapshot();
			props.save(contents);
		})
	}

	function activateSelectTool() {
		if(!editorRef.current) return;
		editorRef.current.setCurrentTool(tool.select);
		setActiveTool(tool.select);
		console.log('set active tool to ', tool.select);
	}
	function activateDrawTool() {
		if(!editorRef.current) return;
		editorRef.current.setCurrentTool(tool.draw);
		setActiveTool(tool.draw);
		console.log('set active tool to ', tool.select);
	}
	function activateEraserTool() {
		if(!editorRef.current) return;
		editorRef.current.setCurrentTool(tool.eraser);
		setActiveTool(tool.eraser);
		console.log('set active tool to ', tool.eraser);
	}
	
};

export default HandwrittenEmbed;




