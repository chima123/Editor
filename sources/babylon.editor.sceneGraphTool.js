var BABYLON;
(function (BABYLON) {
    var EDITOR;
    (function (EDITOR) {
        var SceneGraphTool = (function () {
            /**
            * Constructor
            * @param core: the editor core instance
            */
            function SceneGraphTool(core) {
                // Public members
                this.container = "BABYLON-EDITOR-SCENE-GRAPH-TOOL";
                this.sidebar = null;
                this.panel = null;
                this._graphRootName = "RootScene";
                // Initialize
                this._editor = core.editor;
                this._core = core;
                this.panel = this._editor.layouts.getPanelFromType("right");
                // Register this
                this._core.updates.push(this);
                this._core.eventReceivers.push(this);
            }
            // Pre update
            SceneGraphTool.prototype.onPreUpdate = function () {
            };
            // Post update
            SceneGraphTool.prototype.onPostUpdate = function () {
            };
            // Event
            SceneGraphTool.prototype.onEvent = function (event) {
                if (event.eventType === EDITOR.EventType.GUI_EVENT) {
                    if (event.guiEvent.caller === this.sidebar) {
                        if (event.guiEvent.eventType === EDITOR.GUIEventType.GRAPH_SELECTED) {
                            var ev = new EDITOR.Event();
                            ev.eventType = EDITOR.EventType.SCENE_EVENT;
                            ev.sceneEvent = new EDITOR.SceneEvent(event.guiEvent.data, EDITOR.SceneEventType.OBJECT_PICKED);
                            this._core.editor.editionTool.onEvent(ev);
                            return true;
                        }
                        else if (event.guiEvent.eventType === EDITOR.GUIEventType.GRAPH_MENU_SELECTED) {
                            var object = this._core.currentScene.getNodeByID(this.sidebar.getSelected());
                            if (object && object.dispose) {
                                var parent = object.parent;
                                this._modifyElement(object, parent || this._graphRootName, true);
                                object.dispose();
                            }
                            return true;
                        }
                    }
                }
                else if (event.eventType === EDITOR.EventType.SCENE_EVENT) {
                    if (event.sceneEvent.eventType === EDITOR.SceneEventType.OBJECT_ADDED) {
                        this._modifyElement(event.sceneEvent.object, null);
                        return false;
                    }
                    else if (event.sceneEvent.eventType === EDITOR.SceneEventType.OBJECT_REMOVED) {
                        this._modifyElement(event.sceneEvent.object, object.parent, true);
                        return false;
                    }
                }
                return false;
            };
            // Fills the graph of nodes (meshes, lights, cameras, etc.)
            SceneGraphTool.prototype.fillGraph = function (node, graphNodeID) {
                var children = null;
                var root = null;
                if (!graphNodeID) {
                    this.sidebar.clear();
                    var rootNode = this.sidebar.createNode(this._graphRootName, "Root", "", this._core.currentScene);
                    this.sidebar.addNodes(rootNode);
                    root = this._graphRootName;
                }
                if (!node) {
                    children = [];
                    this._getRootNodes(children, "meshes");
                    this._getRootNodes(children, "lights");
                    this._getRootNodes(children, "cameras");
                }
                else
                    children = node.getDescendants ? node.getDescendants() : [];
                if (root === this._graphRootName)
                    this.sidebar.setNodeExpanded(root, true);
                // If children, then fill the graph recursively
                if (children !== null) {
                    // Set elements before
                    for (var i = 0; i < children.length; i++) {
                        var object = children[i];
                        var icon = this._getObjectIcon(object);
                        var childNode = this.sidebar.createNode(object.id, object.name, icon, object);
                        this.sidebar.addNodes(childNode, root ? root : node.id);
                        this.fillGraph(object, object.id);
                    }
                }
            };
            // Creates the UI
            SceneGraphTool.prototype.createUI = function () {
                if (this.sidebar != null)
                    this.sidebar.destroy();
                this.sidebar = new EDITOR.GUI.GUIGraph(this.container, this._core);
                // Set menus
                this.sidebar.addMenu("BABYLON-EDITOR-SCENE-GRAPH-TOOL-REMOVE", 'Remove', 'icon-error');
                // Build element
                this.sidebar.buildElement(this.container);
                /// Default node
                var node = this.sidebar.createNode(this._graphRootName, "Root", "", this._core.currentScene);
                this.sidebar.addNodes(node);
            };
            // Fills the result array of nodes when the node hasn't any parent
            SceneGraphTool.prototype._getRootNodes = function (result, entities) {
                var elements = this._core.currentScene[entities];
                for (var i = 0; i < elements.length; i++) {
                    if (!elements[i].parent) {
                        result.push(elements[i]);
                    }
                }
            };
            // Returns the appropriate icon of the node (mesh, animated mesh, light, camera, etc.)
            SceneGraphTool.prototype._getObjectIcon = function (node) {
                if (node instanceof BABYLON.Mesh) {
                    // Check particles
                    if (!node.geometry) {
                        var scene = node.getScene();
                        for (var i = 0; i < scene.particleSystems.length; i++) {
                            if (scene.particleSystems[i].emitter === node)
                                return "icon-particles";
                        }
                    }
                    // Else...
                    if (node.skeleton)
                        return "icon-animated-mesh";
                    else
                        return "icon-mesh";
                }
                else if (node instanceof BABYLON.Light) {
                    if (node instanceof BABYLON.DirectionalLight)
                        return "icon-directional-light";
                    else if (node instanceof BABYLON.PointLight)
                        return "icon-add-light";
                }
                else if (node instanceof BABYLON.Camera)
                    return "icon-camera";
                return "";
            };
            // Removes or adds a node from/to the graph
            SceneGraphTool.prototype._modifyElement = function (node, parentNode, remove) {
                if (remove === void 0) { remove = false; }
                if (!node)
                    return;
                if (!remove) {
                    // Add node
                    var icon = this._getObjectIcon(node);
                    this.sidebar.addNodes(this.sidebar.createNode(node.id, node.name, icon, node), parentNode ? parentNode.id : this._graphRootName);
                }
                else
                    this.sidebar.removeNode(node.id);
                this.sidebar.refresh();
            };
            return SceneGraphTool;
        })();
        EDITOR.SceneGraphTool = SceneGraphTool;
    })(EDITOR = BABYLON.EDITOR || (BABYLON.EDITOR = {}));
})(BABYLON || (BABYLON = {}));
//# sourceMappingURL=babylon.editor.sceneGraphTool.js.map