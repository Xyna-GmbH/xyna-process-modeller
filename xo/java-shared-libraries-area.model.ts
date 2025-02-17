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
import { XoArray, XoArrayClass, XoObjectClass, XoProperty, XoTransient } from '@zeta/api';

import { XoJavaSharedLibrary } from './java-shared-library.model';
import { XoContainerArea } from './modelling-item.model';


@XoObjectClass(XoContainerArea, 'xmcp.processmodeller.datatypes.servicegroupmodeller', 'JavaSharedLibrariesArea')
export class XoJavaSharedLibrariesArea extends XoContainerArea {

    @XoProperty()
    @XoTransient()
    javaSharedLibraries: XoJavaSharedLibrary[] = [];


    afterDecode() {
        super.afterDecode();

        this.javaSharedLibraries = this.items
            ? this.items.data.filter(item => item instanceof XoJavaSharedLibrary).map(item => item)
            : [];
    }

}

@XoArrayClass(XoJavaSharedLibrariesArea)
export class XoJavaSharedLibrariesAreaArray extends XoArray<XoJavaSharedLibrariesArea> {
}
