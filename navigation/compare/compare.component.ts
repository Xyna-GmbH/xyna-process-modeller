/*
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 * Copyright 2022 GIP SmartMercial GmbH, Germany
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
import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { XMOMState } from '@pmod/api/xmom.service';
import { DocumentService } from '@pmod/document/document.service';
import { DocumentItem, DocumentModel } from '@pmod/document/model/document.model';
import { WorkflowDocumentModel } from '@pmod/document/model/workflow-document.model';
import { XoWorkflow } from '@pmod/xo/workflow.model';
import { FullQualifiedName } from '@zeta/api';

import { CommonNavigationComponent } from '../common-navigation-class/common-navigation-component';


@Component({
    selector: 'xfm-mod-nav-compare',
    templateUrl: './compare.component.html',
    styleUrls: ['./compare.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CompareComponent extends CommonNavigationComponent {

    workflow: XoWorkflow;
    document: DocumentModel<XoWorkflow>;

    constructor(cdr: ChangeDetectorRef, protected documentService: DocumentService) {
        super(cdr);
    }


    loadDeployedWorkflow() {
        const workflowDocument = this.documentService.selectedDocument as DocumentModel<XoWorkflow>;

        if (workflowDocument) {
            const savedWorkflow = workflowDocument.item;
            this.documentService.loadXmomObject(
                savedWorkflow.$rtc.runtimeContext(),
                FullQualifiedName.decode(savedWorkflow.$fqn),
                savedWorkflow.type, false, XMOMState.DEPLOYED
            ).subscribe(response => {
                this.workflow = <DocumentItem>response.xmomItem as XoWorkflow;

                this.document = new WorkflowDocumentModel(this.workflow, workflowDocument.originRuntimeContext);
                const lockInfo = {...workflowDocument.lockInfo};
                lockInfo.readonly = true;
                this.document.updateLock(lockInfo);

                this.updateView();
            });
        }
    }
}
