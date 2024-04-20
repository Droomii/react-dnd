// Created by kdw0601 on 2024-04-19

import {
	createContext, HTMLAttributes, MutableRefObject,
	PropsWithChildren, ReactNode,
	useContext,
	useRef,
	useState
} from 'react';

interface DraggingItemInfo {
	droppableSn: number;
	sn: number;
}

interface DndContextProps {
	draggingItemInfo: MutableRefObject<DraggingItemInfo | null>;
	dropDestinationSn: number | null;
	setDropDestinationSn: (sn: number | null) => void;
	handleStartDragging: (draggingItemSn: number, dropDepartSn: number) => void;
	handleStopDragging: () => void;
	onMove: (itemSn: number, fromGroupSn: number, toGroupSn: number, index: number) => void;
	shiftedItem: null | { sn: number; index: number; direction: 'before' | 'after' };
	setShiftedItem: (val: null | { sn: number; index: number; direction: 'before' | 'after' }) => void;
	dropIndicator: ReactNode;
}

const Dnd = createContext<DndContextProps | null>(null);

interface ProviderProps {
	onMove: (itemSn: number, fromGroupSn: number, toGroupSn: number, index?: number) => void;
	dropIndicator: ReactNode;
}

export const DndController = (props: PropsWithChildren<ProviderProps>) => {
	const draggingItemInfo = useRef<DraggingItemInfo | null>(null);
	const [dropDestinationSn, setDropDestinationSn] = useState<number | null>(null);
	const [shiftedItem, setShiftedItem] = useState<null | { sn: number; index: number; direction: 'before' | 'after' }>(null);

	const handleStartDragging = (sn: number, droppableSn: number) => {
		draggingItemInfo.current = { sn, droppableSn };
	};

	const handleStopDragging = () => {
		const dragItemInfo = draggingItemInfo.current;
		if (dragItemInfo && dropDestinationSn) {
			const index = shiftedItem && (shiftedItem.index ?? 0) + Number(shiftedItem.direction === 'before');
			props.onMove(dragItemInfo.sn, dragItemInfo.droppableSn, dropDestinationSn, index ?? undefined);
		}

		draggingItemInfo.current = null;
		setDropDestinationSn(null);
		setShiftedItem(null);
	};

	return (
		<Dnd.Provider value={{
			draggingItemInfo,
			handleStartDragging,
			handleStopDragging,
			dropDestinationSn,
			setDropDestinationSn,
			onMove: props.onMove,
			shiftedItem, setShiftedItem,
			dropIndicator: props.dropIndicator
		}}>
			{props.children}
		</Dnd.Provider>
	);
};

const useDndContext = () => {
	const dndContext = useContext(Dnd);
	if (!dndContext) {
		throw new Error('Dnd components must be used within DndContextProvider');
	}
	return dndContext;
};

type ChildrenProps = {
	dragHandlers: Pick<HTMLAttributes<HTMLElement>, 'onDragStart' | 'onDragEnd' | 'draggable' | 'onDragOver'>,
	isDragging: boolean
}

interface DraggableProps {
	children: (forwardProps: ChildrenProps) => ReactNode;
	sn: number;
	index: number;
}

export const DraggableDiv = (props: DraggableProps) => {
	const { sn, children, index } = props;
	const { handleStartDragging, handleStopDragging, shiftedItem, setShiftedItem, dropIndicator } = useDndContext();
	const [isDragging, setIsDragging] = useState(false);
	const parentSn = useContext(DroppableContext).sn;

	const onDragStart = (e: React.DragEvent) => {
		const target = e.currentTarget as HTMLElement;
		const { top, left } = target.getBoundingClientRect();

		e.dataTransfer.setDragImage(e.currentTarget, e.clientX - left, e.clientY - top);
		setIsDragging(true);

		handleStartDragging(sn, parentSn);
	};

	const onDragEnd = () => {
		setIsDragging(false);
		handleStopDragging();
	};

	const onDragOver = (e: React.DragEvent<HTMLElement>) => {
		const { height, top } = e.currentTarget.getBoundingClientRect();
		const direction = (e.clientY - top) / height > 0.5 ? 'before' : 'after';

		if (shiftedItem && sn === shiftedItem?.sn && shiftedItem?.direction === direction) {
			return;
		}

		setShiftedItem({ sn, direction, index });
	};

	const render = children({
		dragHandlers: {
			onDragStart,
			onDragEnd,
			onDragOver,
			draggable: true
		},
		isDragging
	});

	return <>
		{shiftedItem?.sn === sn && shiftedItem?.direction === 'after' && dropIndicator}
		{render}
		{shiftedItem?.sn === sn && shiftedItem?.direction === 'before' && dropIndicator}
	</>;
};

type DroppableChildrenProps = {
	dropHandlers: Pick<HTMLAttributes<HTMLElement>, 'onDragEnter' | 'onDragLeave' | 'onDragOver'>,
	isDraggingOver: boolean
}

interface DroppableProps {
	sn: number;
	children: (props: DroppableChildrenProps) => ReactNode;
}

const DroppableContext = createContext<{ sn: number }>({ sn: 0 });

export const DroppableDiv = (({ sn, children }: DroppableProps) => {
	const { draggingItemInfo, dropDestinationSn, setDropDestinationSn, setShiftedItem } = useDndContext();

	const onDragOver = (e: React.DragEvent) => {
		if (!draggingItemInfo.current) {
			return;
		}
		e.preventDefault();
		e.dataTransfer.dropEffect = 'move';
	};

	const onDragLeave = (e: React.DragEvent) => {
		if (e.currentTarget.contains(document.elementFromPoint(e.clientX, e.clientY))) {
			return;
		}
		setShiftedItem(null);
		setDropDestinationSn(null);
	};

	const onDragEnter = () => {
		if (!draggingItemInfo.current) {
			return;
		}
		setDropDestinationSn(sn);
	};

	return <DroppableContext.Provider value={{ sn }}>{children({
		dropHandlers: { onDragLeave, onDragEnter, onDragOver },
		isDraggingOver: dropDestinationSn === sn
	})}</DroppableContext.Provider>;
});
