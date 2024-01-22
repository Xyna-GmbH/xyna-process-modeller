/*
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 * Copyright 2023 Xyna GmbH, Germany
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 */
import { ApiService, FullQualifiedName, RuntimeContext, Xo, XoDescriber, XoJson, XoStructureArray, XoStructureComplexField, XoStructureField, XoStructureObject, XoStructurePrimitive, XoStructureType } from '@zeta/api';
import { Comparable, GraphicallyRepresented, IComparable } from '@zeta/base';
import { BehaviorSubject, Observable, first, map } from 'rxjs';
import { Draggable } from '../../shared/drag-and-drop/mod-drag-and-drop.service';


export interface ComparablePath extends IComparable {
    get child(): ComparablePath;
}


export interface Traversable {
    /**
     * Traverses a structure and returns that element that equals to `item`
     *
     * @param item Item to traverse structure with and to compare to each `Traversable`
     * @returns `Traversable` equal to `item`
     */
    traverse(item: IComparable): Traversable;

    /**
     * Traverses a structure and looks for a path that matches `path`
     *
     * @param path Path to traverse structure with and to compare to each `Traversable`
     * @returns `Traversable` at the end of a path equal to `path`
     */
    match(path: ComparablePath): Traversable;
}


export interface TreeNodeFactory {
    createNodeFromStructure(structure: XoStructureField): SkeletonTreeNode;
    createPrimitiveNode(structure: XoStructurePrimitive): PrimitiveSkeletonTreeNode;
    createComplexNode(structure: XoStructureComplexField): ComplexSkeletonTreeNode;
    createArrayNode(structure: XoStructureArray): ArraySkeletonTreeNode;
    createArrayEntryNode(structure: XoStructureArray): ArrayEntrySkeletonTreeNode;
    /**
     * Enrich given structure with children
     */
    enrichStructure(structure: XoStructureObject): Observable<XoStructureObject>;
}


export interface TreeNodeObserver {
    nodeChange(node: SkeletonTreeNode): void;
}


export class SkeletonTreeNode extends Comparable implements Traversable, GraphicallyRepresented<Element>, Draggable {
    private _structure: XoStructureField;
    private _isList: boolean;
    collapsible = true;
    private _collapsed = true;

    /** Node is marked for some reason and can be rendered differently than an unmarked node */
    private readonly _marked$ = new BehaviorSubject<boolean>(false);
    private readonly _selected$ = new BehaviorSubject<boolean>(false);

    private readonly _graphicalRepresentation$ = new BehaviorSubject<Element>(null);

    protected _children: SkeletonTreeNode[] = [];
    protected _parent: SkeletonTreeNode;

    constructor(structure: XoStructureField, protected nodeFactory: TreeNodeFactory, protected nodeObservers: Set<TreeNodeObserver> = new Set<TreeNodeObserver>()) {
        super();
        this.setStructure(structure);
    }


    getStructure(): XoStructureField {
        return this._structure;
    }


    setStructure(structure: XoStructureField) {
        this._structure = structure;
    }


    get collapsed(): boolean {
        return this._collapsed;
    }


    collapse() {
        this._collapsed = true;
        this.notifyObservers();
    }


    uncollapse() {
        this._collapsed = false;
        this.notifyObservers();
    }


    get isList(): boolean {
        return this._isList;
    }


    set isList(value: boolean) {
        this._isList = value;
    }


    get markedChange(): Observable<boolean> {
        return this._marked$.asObservable();
    }


    get marked(): boolean {
        return this._marked$.value;
    }


    set marked(value: boolean) {
        this._marked$.next(value);
    }


    markRecursively() {
        this.marked = true;
        this.children.forEach(child => child.markRecursively());
    }


    get allChildrenMarked(): boolean {
        return !this.children.some(child => !child.marked);
    }


    get selectedChange(): Observable<boolean> {
        return this._selected$.asObservable();
    }


    get selected(): boolean {
        return this._selected$.value;
    }


    set selected(value: boolean) {
        if (value !== this.selected) {
            this._selected$.next(value);
        }
    }


    destroy() {
        this.selected = false;
    }


    get name(): string {
        return this.getStructure().name;
    }


    get label(): string {
        return this.getStructure().label?.length === 0 ? this.getStructure().name : this.getStructure().label;
    }


    get typeLabel(): string {
        return this.getStructure().typeLabel;
    }


    get children(): SkeletonTreeNode[] {
        return this._children;
    }


    get parent(): SkeletonTreeNode {
        return this._parent;
    }


    set parent(value: SkeletonTreeNode) {
        this._parent = value;
    }


    addObserver(observer: TreeNodeObserver) {
        this.nodeObservers.add(observer);
    }

    removeObserver(observer: TreeNodeObserver) {
        this.nodeObservers.delete(observer);
    }

    notifyObservers() {
        this.nodeObservers?.forEach(observer => observer.nodeChange(this));
    }


    /**
     * @inheritdoc
     */
    traverse(item: IComparable): Traversable {
        return this.equals(item)
            ? this
            : this.children.find(node => node.equals(item));
    }


    /**
     * @inheritdoc
     */
    match(path: ComparablePath): Traversable {
        if (this.equals(path)) {
            let matchingNode: Traversable;
            if (path.child) {
                let i = 0;
                while (i < this.children.length && !(matchingNode = this.children[i].match(path.child))) {
                    i++;
                }
            }
            return matchingNode ?? this;
        }
        return null;
    }


    /**
     * Returns XFL expression of this node up to its root
     */
    toXFL(): string {
        const prefix = this.parent?.toXFL() ?? '';
        return (prefix.length > 0 ? prefix + '.' : '') + this.getXFLExpression();
    }


    /**
     * Returns XFL expression of this node
     * @remark To be overridden by each node
     */
    protected getXFLExpression(): string {
        return '';
    }


    /**
     * @inheritdoc
     */
    get graphicalRepresentation(): Element {
        return this._graphicalRepresentation$.value;
    }

    set graphicalRepresentation(value: Element) {
        if (this.graphicalRepresentation !== value) {
            this._graphicalRepresentation$.next(value);
        }
    }

    graphicalRepresentationChange(): Observable<Element> {
        return this._graphicalRepresentation$.asObservable();
    }


    /* ***   Draggable   *** */


    get id(): string {
        return this.label;
    }

    get fqn(): FullQualifiedName {
        return this.getStructure().typeFqn ?? FullQualifiedName.fromPrimitive('String');
    }

    encode(into?: XoJson, parent?: Xo): XoJson {
        return { $meta: { fqn: this.fqn.encode(), rtc: this.getStructure().typeRtc?.encode() ?? undefined } };
    }
}



export class PrimitiveSkeletonTreeNode extends SkeletonTreeNode {

    constructor(structure: XoStructureField, nodeFactory: TreeNodeFactory, nodeObservers: Set<TreeNodeObserver>) {
        super(structure, nodeFactory, nodeObservers);
        this.collapsible = false;
    }

    getStructure(): XoStructurePrimitive {
        return super.getStructure() as XoStructurePrimitive;
    }


    getName(): string {
        return this.getStructure()?.label ?? this.getStructure()?.name ?? 'undefined';
    }


    /**
     * @inheritdoc
     */
    protected getXFLExpression(): string {
        return this.getStructure()?.name ?? '';
    }
}



export class ComplexSkeletonTreeNode extends SkeletonTreeNode {
    private _subtypes: XoStructureType[] = [];
    private _sourceIndex: number;
    private neverUncollapsed = true;


    getStructure(): XoStructureObject {
        return super.getStructure() as XoStructureObject;
    }


    setStructure(structure: XoStructureField): void {
        super.setStructure(structure);

        // here comes the whole structure including children and their types
        // build all node children here and give them their describer

        this._children.splice(0);
        this.getStructure().children.forEach(field => {
            const node = this.nodeFactory.createNodeFromStructure(field);
            if (node) {
                this._children.push(node);
                node.parent = this;
            }
        });
        this.notifyObservers();
    }


    uncollapse() {
        super.uncollapse();

        // retrieve full object structure
        if (this.neverUncollapsed) {
            this.nodeFactory.enrichStructure(this.getStructure()).subscribe(structure => this.setStructure(structure));
            this.neverUncollapsed = false;
        }
    }


    // refreshSubtypes() {
    //     // TODO: only if complex (fqn has a dot in it - is there already an "isComplex" or "isPrimitive" function inside fqn?)
    //     this.api.getSubtypes(this.rtc, [this.describer]).get(this.describer).pipe(first()).subscribe(subtypes => this.setSubtypes(subtypes));
    // }


    setSubtypes(subtypes: XoStructureType[]) {
        this._subtypes = subtypes;
    }


    get sourceIndex(): number {
        return this._sourceIndex;
    }


    set sourceIndex(value: number) {
        this._sourceIndex = value;
    }


    protected getXFLExpression(): string {
        return this.sourceIndex !== undefined
            ? `%${this.sourceIndex}%`
            : this.getStructure()?.name ?? '';
    }
}


export class ArraySkeletonTreeNode extends ComplexSkeletonTreeNode {

}


export class ArrayEntrySkeletonTreeNode extends ComplexSkeletonTreeNode {

}


export interface VariableDescriber extends XoDescriber {
    label: string;
    isList: boolean;
}


export interface SkeletonTreeDataSourceObserver {
    nodeChange(dataSource: SkeletonTreeDataSource, node: SkeletonTreeNode): void;
}


/**
 * Data Source for a tree made of a data type structure.
 * In contrast to the StructureTreeDataSource, this data source does not hold instances of the structured data types but
 * only represents the data type's skeleton itself
 *
 * @param T Graphical representation. In an HTML context, this is usually a DOM element
 */
export class SkeletonTreeDataSource implements TreeNodeFactory, TreeNodeObserver {
    private readonly _root$ = new BehaviorSubject<SkeletonTreeNode>(null);


    /**
     * @param rootIndex Index of root variable in outer context
     */
    constructor(protected describer: VariableDescriber, protected api: ApiService, protected rtc: RuntimeContext, protected observer: SkeletonTreeDataSourceObserver, protected rootIndex: number = undefined) {
    }


    refresh() {
        this.api.getStructure(this.rtc, [this.describer]).get(this.describer).pipe(first()).subscribe(structure => this.setStructure(structure));
    }


    setStructure(structure: XoStructureField) {
        structure.label = this.describer.label;
        const node = this.createNodeFromStructure(structure);
        node.isList = this.describer.isList;
        if (node instanceof ComplexSkeletonTreeNode) {
            node.sourceIndex = this.rootIndex;
        }
        this._root$.next(node);
    }


    get root$(): Observable<SkeletonTreeNode> {
        return this._root$.asObservable();
    }


    get root(): SkeletonTreeNode {
        return this._root$.value;
    }



    /* ***   Tree Node Factory   *** */

    createNodeFromStructure(structure: XoStructureField): SkeletonTreeNode {
        let node: SkeletonTreeNode = null;
        if (structure instanceof XoStructurePrimitive) {
            node = this.createPrimitiveNode(structure);
        } else if (structure instanceof XoStructureComplexField) {
            node = this.createComplexNode(structure);
        } else if (structure instanceof XoStructureArray) {
            // TODO
        }
        return node;
    }


    createPrimitiveNode(structure: XoStructurePrimitive): PrimitiveSkeletonTreeNode {
        return new PrimitiveSkeletonTreeNode(structure, this, new Set<TreeNodeObserver>([this]));
    }


    createComplexNode(structure: XoStructureComplexField): ComplexSkeletonTreeNode {
        return new ComplexSkeletonTreeNode(structure, this, new Set<TreeNodeObserver>([this]));
    }


    createArrayNode(structure: XoStructureArray): ArraySkeletonTreeNode {
        return new ArraySkeletonTreeNode(structure, this, new Set<TreeNodeObserver>([this]));
    }


    createArrayEntryNode(structure: XoStructureArray): ArrayEntrySkeletonTreeNode {
        return new ArraySkeletonTreeNode(structure, this, new Set<TreeNodeObserver>([this]));
    }


    enrichStructure(structure: XoStructureObject): Observable<XoStructureObject> {
        const describer = <XoDescriber>{ rtc: structure.typeRtc, fqn: structure.typeFqn };
        return this.api.getStructure(structure.typeRtc, [describer]).get(describer).pipe(
            first(),
            map(enrichedStructure => {
                // only take children of response and leave the rest of the structure alone
                // (the origin structure might have context specific data like a 'parent' or a parent-specific 'label')
                structure.children = enrichedStructure.children;
                return structure;
            })
        );
    }


    nodeChange(node: SkeletonTreeNode): void {
        this.observer?.nodeChange(this, node);
    }
}
