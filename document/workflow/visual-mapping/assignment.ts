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

import { XoFormula } from '@pmod/xo/formula.model';
import { SkeletonTreeNode } from '../variable-tree/data-source/skeleton-tree-data-source';
import { XoVariable } from '@pmod/xo/variable.model';
import { FormulaPartVariable } from '@pmod/xo/util/formula-parts/formula-part-variable';
import { FormulaPartOperation } from '@pmod/xo/util/formula-parts/formula-part-operation';
import { FormulaPartMember } from '@pmod/xo/util/formula-parts/formula-part-member';
import { Comparable } from '@zeta/base';
import { FormulaPartSpecial } from '@pmod/xo/util/formula-parts/formula-part-special';
import { RekursiveStruckturePart } from '@pmod/xo/expressions/comparable-path';


// export abstract class XoFormulaNode extends Comparable implements RekursiveStruckturePart {
//     value: string;

//     abstract parse(formula: XoFormula, index: number): void;

//     get child(): XoFormulaNode {
//         return null;
//     }
// }

// export class XoFormulaOperationNode extends XoFormulaNode {
//     operation: string;      // function like "length" or operation like "+" or "="
//     operands: XoFormulaNode[];

//     parse(formula: XoFormula, index: number) {
//         this.operation = (formula.parts[index] as FormulaPartOperation)?.part ?? '<noop>';
//         // TODO parse operands
//     }
// }

// export abstract class XoFormulaVariableNode extends XoFormulaNode {
//     variable: XoVariable;
//     member: XoFormulaMemberNode;

//     get child(): XoFormulaMemberNode {
//         return this.member;
//     }
// }

// export class XoFormulaMemberNode extends XoFormulaVariableNode {

//     parse(formula: XoFormula, index: number) {
//         const part = formula.parts[index] as FormulaPartMember;
//         this.variable = part.variable;


//         // **********************************
//         // FIXME: COPY & PASTE FROM BELOW
//         // **********************************

//         if (formula.parts[index + 1] instanceof FormulaPartSpecial && formula.parts[index + 1].part === '[') {
//             // special handling for array entries: skip array index
//             do {
//                 index++;
//             } while (formula.parts.length > index + 2 && formula.parts[index]?.part !== ']');
//         }

//         const nextPart = formula.parts[index + 1];

//         if (nextPart instanceof FormulaPartMember) {
//             this.member = new XoFormulaMemberNode();
//             this.member.parse(formula, index + 1);
//         }
//     }
// }

// export class XoFormulaRootVariableNode extends XoFormulaVariableNode {
//     variableIndex: number;

//     parse(formula: XoFormula, index: number) {
//         const part = formula.parts[index] as FormulaPartVariable;
//         this.variable = part.variable;
//         this.variableIndex = part.index;

//         if (formula.parts[index + 1] instanceof FormulaPartSpecial && formula.parts[index + 1].part === '[') {
//             // special handling for array entries: skip array index
//             do {
//                 index++;
//             } while (formula.parts.length > index + 2 && formula.parts[index]?.part !== ']');
//         }

//         const nextPart = formula.parts[index + 1];

//         if (nextPart instanceof FormulaPartMember) {
//             this.member = new XoFormulaMemberNode();
//             this.member.parse(formula, index + 1);
//         }
//     }
// }



// export class MemberPath {
//     private _node: SkeletonTreeNode;

//     constructor(public formula: XoFormulaRootVariableNode) {
//     }

//     get node(): SkeletonTreeNode {
//         return this._node;
//     }

//     set node(value: SkeletonTreeNode) {
//         this._node = value;

//         // mark node and its children for being assigned
//         if (this.node) {
//             this.node.markRecursively();
//         }
//     }
// }


// export class Assignment {
//     destination: MemberPath;
//     sources: MemberPath[] = [];
//     leftExpressionPart: string;
//     rightExpressionPart: string;

//     constructor(protected formula: XoFormula) {

//         let assignmentOperatorIndex = formula.parts.findIndex(part => part.part === '=');
//         if (assignmentOperatorIndex < 0) {
//             assignmentOperatorIndex = formula.parts.length;
//         }
//         this.leftExpressionPart = formula.parts.slice(0, assignmentOperatorIndex).map(part => part.part).join();
//         this.rightExpressionPart = formula.parts.slice(assignmentOperatorIndex + 1).map(part => part.part).join();

//         formula.parts.forEach((part, index) => {
//             if (part instanceof FormulaPartVariable) {
//                 const formulaVariableNode = new XoFormulaRootVariableNode();
//                 formulaVariableNode.parse(formula, index);

//                 if (index < assignmentOperatorIndex && !this.destination) {
//                     this.destination = new MemberPath(formulaVariableNode);
//                 } else {
//                     this.sources.push(new MemberPath(formulaVariableNode));
//                 }
//             }
//         });
//     }


//     get memberPaths(): MemberPath[] {
//         return this.sources.concat(this.destination ?? []);
//     }
// }
