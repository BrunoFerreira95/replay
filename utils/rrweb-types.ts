import { record as rrwebRecord } from 'rrweb';
export enum EventType {
    FullSnapshot = 0,
    IncrementalSnapshot = 1,
    Meta = 2,
}

export enum IncrementalSource {
    Mutation = 0,
    MouseMove = 1,
    MouseInteraction = 2,
    Scroll = 3,
    ViewportResize = 4,
    Input = 5,
    TouchMove = 6,
    MediaInteraction = 7,
    StyleSheetRule = 8,
    CanvasMutation = 9,
    Font = 10,
    Log = 11,
    Drag = 12,
    StyleDeclaration = 13,
    Selection = 14,
    AdoptedStyleSheet = 15,
}

export enum MouseInteractions {
    MouseUp = 0,
    MouseDown = 1,
    Click = 2,
    ContextMenu = 3,
    DblClick = 4,
    Focus = 5,
    Blur = 6,
    TouchStart = 7,
    TouchEnd = 8,
    TouchCancel = 9,
}


export const RrwebEvents = {
    EventType: {
        FullSnapshot: EventType.FullSnapshot,
        IncrementalSnapshot: EventType.IncrementalSnapshot,
        Meta: EventType.Meta,
    },
    IncrementalSource: {
        Mutation: IncrementalSource.Mutation,
        MouseMove: IncrementalSource.MouseMove,
        MouseInteraction: IncrementalSource.MouseInteraction,
        Scroll: IncrementalSource.Scroll,
        ViewportResize: IncrementalSource.ViewportResize,
        Input: IncrementalSource.Input,
        TouchMove: IncrementalSource.TouchMove,
        MediaInteraction: IncrementalSource.MediaInteraction,
        StyleSheetRule: IncrementalSource.StyleSheetRule,
        CanvasMutation: IncrementalSource.CanvasMutation,
        Font: IncrementalSource.Font,
        Log: IncrementalSource.Log,
        Drag: IncrementalSource.Drag,
        StyleDeclaration: IncrementalSource.StyleDeclaration,
        Selection: IncrementalSource.Selection,
        AdoptedStyleSheet: IncrementalSource.AdoptedStyleSheet,
    },
    MouseInteractions: {
        MouseUp: MouseInteractions.MouseUp,
        MouseDown: MouseInteractions.MouseDown,
        Click: MouseInteractions.Click,
        ContextMenu: MouseInteractions.ContextMenu,
        DblClick: MouseInteractions.DblClick,
        Focus: MouseInteractions.Focus,
        Blur: MouseInteractions.Blur,
        TouchStart: MouseInteractions.TouchStart,
        TouchEnd: MouseInteractions.TouchEnd,
        TouchCancel: MouseInteractions.TouchCancel,
    },
} as const

import type { RrwebEvent } from 'rrwebb';

export interface RecordOptions {
    emit?: (event: RrwebEvent) => void;
    checkoutEveryNth?: number;
    maskAllText?: boolean;
    maskTextClass?: string;
    maskTextSelector?: string;
    ignoreClass?: string;
    session_id?: string;
    ignoreSelector?: string;
    maskInputOptions?: {
        password?: boolean,
        text?: boolean
    },
    hooks?: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        mutation?: (mutation: any) => any | void,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        mousemove?: (event: any) => any | void,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        mouseInteraction?: (event: any) => any | void,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        scroll?: (event: any) => any | void,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        viewportResize?: (event: any) => any | void,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        input?: (event: any) => any | void,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        touchMove?: (event: any) => any | void,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        mediaInteraction?: (event: any) => any | void,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        styleSheetRule?: (event: any) => any | void,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        canvasMutation?: (event: any) => any | void,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        font?: (event: any) => any | void,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        log?: (event: any) => any | void,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        drag?: (event: any) => any | void,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        styleDeclaration?: (event: any) => any | void,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        selection?: (event: any) => any | void,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        adoptedStyleSheet?: (event: any) => any | void,
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    plugins?: any[];
    inlineStylesheet?: boolean;
    inlineImages?: boolean;
    blockClass?: string;
    blockSelector?: string;
    recordCanvas?: boolean;
    recordCrossOriginIframes?: boolean;
}


export function record(options: RecordOptions) {
    if (typeof window === 'undefined') {
        throw new Error('rrweb só pode ser executado no lado do cliente.');
    }

    const stopRecording = rrwebRecord(options);

    return {
        stop: stopRecording, // Apenas uma função para interromper a gravação
        takeFullSnapshot: () => rrwebRecord.takeFullSnapshot?.(), // Chama rrweb.takeFullSnapshot() para um snapshot manual
    };
}