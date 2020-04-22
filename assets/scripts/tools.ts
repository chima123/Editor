/**
 * Generated by the Babylon.JS Editor v${editor-version}
 */

import {
    Scene, Node, Mesh,
    SSAO2RenderingPipeline, DefaultRenderingPipeline, StandardRenderingPipeline,
} from "@babylonjs/core";

export type ScriptMap = {
    [index: string]: {
        default: (new (...args: any[]) => Node);
    }
};

/**
 * Requires the nedded scripts for the given nodes array and attach them.
 * @param nodes the array of nodes to attach script (if exists).
 */
function requireScriptForNodes(scriptsMap: ScriptMap, nodes: Node[]): void {
    for (const n of nodes) {
        if (!n.metadata || !n.metadata.script || !n.metadata.script.name || n.metadata.script.name === "None") { continue; }

        const exports = scriptsMap[n.metadata.script.name];
        if (!exports) { continue; }

        // Add prototype.
        const prototype = exports.default.prototype;
        for (const key in prototype) {
            if (!prototype.hasOwnProperty(key) || key === "constructor") { continue; }
            n[key] = prototype[key].bind(n);
        }

        // Call constructor
        prototype.constructor.call(n);

        // Check start
        if (exports.default.prototype.onStart) {
            n.getScene().onBeforeRenderObservable.addOnce(() => n["onStart"]());
        }

        // Check update
        if (exports.default.prototype.onUpdate) {
            n.getScene().onBeforeRenderObservable.add(() => n["onUpdate"]());
        }

        // Check properties
        const properties = n.metadata.script.properties ?? { };
        for (const key in properties) {
            const p = properties[key];
            n[key] = p.value;
        }

        // Check linked children.
        const childrenLinks = (exports.default as any)._ChildrenValues ?? [];
        for (const link of childrenLinks) {
            const child = n.getChildren((node => node.name === link.nodeName), true)[0];
            n[link.propertyKey] = child;
        }

        // Check linked nodes from scene.
        const sceneLinks = (exports.default as any)._SceneValues ?? [];
        for (const link of sceneLinks) {
            const node = n._scene.getNodeByName(link.nodeName);
            n[link.propertyKey] = node;
        }

        // Check pointer events
        const pointerEvents = (exports.default as any)._PointerValues ?? [];
        for (const event of pointerEvents) {
            n._scene.onPointerObservable.add((e) => {
                if (e.type !== event.type) { return; }
                if (!event.onlyWhenMeshPicked) { return n[event.propertyKey](e); }

                if (e.pickInfo?.pickedMesh === n) {
                    n[event.propertyKey](e);
                }
            });
        }

        // Check keyboard events
        const keyboardEvents = (exports.default as any)._KeyboardValues ?? [];
        for (const event of keyboardEvents) {
            n._scene.onKeyboardObservable.add((e) => {
                if (event.type && e.type !== event.type) { return; }
                
                if (!event.keys.length) { return n[event.propertyKey](e); }

                if (event.keys.indexOf(e.event.keyCode) !== -1) {
                    n[event.propertyKey](e);
                }
            });
        }

        // Retrieve impostors
        if (n instanceof Mesh && !n.physicsImpostor) {
            n.physicsImpostor = n._scene.getPhysicsEngine()?.getImpostorForPhysicsObject(n);
        }
    }
}

/**
 * Attaches all available scripts on nodes of the given scene.
 * @param scene the scene reference that contains the nodes to attach scripts.
 */
export function attachScripts(scriptsMap: ScriptMap, scene: Scene): void {
    requireScriptForNodes(scriptsMap, scene.meshes);
    requireScriptForNodes(scriptsMap, scene.lights);
    requireScriptForNodes(scriptsMap, scene.cameras);
    requireScriptForNodes(scriptsMap, scene.transformNodes);
}

/**
 * Configures and attaches the post-processes of the given scene.
 * @param scene the scene where to create the post-processes and attach to its cameras.
 * @param rootUrl the root Url where to find extra assets used by pipelines. Should be the same as the scene.
 */
export function configurePostProcesses(scene: Scene, rootUrl: string = null): void {
    if (rootUrl === null || !scene.metadata?.postProcesses) { return; }

    // Load  post-processes configuration
    const data = scene.metadata.postProcesses;
    if (data.ssao) {
        const ssao = SSAO2RenderingPipeline.Parse(data.ssao.json, scene, rootUrl);
        if (data.ssao.enabled) {
            scene.postProcessRenderPipelineManager.attachCamerasToRenderPipeline(ssao.name, scene.cameras);
        }
    }
    if (data.standard) {
        const standard = StandardRenderingPipeline.Parse(data.standard.json, scene, rootUrl);
        if (!data.standard.enabled) {
            scene.postProcessRenderPipelineManager.detachCamerasFromRenderPipeline(standard.name, scene.cameras);
        }
    }
    if (data.default) {
        const def = DefaultRenderingPipeline.Parse(data.default.json, scene, rootUrl);
        if (!data.default.enabled) {
            scene.postProcessRenderPipelineManager.detachCamerasFromRenderPipeline(def.name, scene.cameras);
        }
    }
}

// ${decorators}
