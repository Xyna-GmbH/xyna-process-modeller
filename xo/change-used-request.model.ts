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
import { XoObjectClass, XoProperty } from '@zeta/api';

import { XoRequest } from './request.model';


/**
 * Change label of an Item
 * @see XoChangeTextRequest for changing the text of an Area
 */
@XoObjectClass(XoRequest, 'xmcp.processmodeller.datatypes.request', 'ChangeUsedRequest')
export class XoUsedRequest extends XoRequest {

    @XoProperty()
    isUsed: boolean;


    constructor(_ident?: string, value?: boolean) {
        super(_ident);
        this.isUsed = value;
    }
}
