// Created by kdw0601 on 2024-04-19

import {createContext, useContext, useEffect, useRef} from 'react';

interface IDroppableArea {

}

interface DraggableContextProps {

}

interface DndContextProps {
  mountDroppableArea: (droppableArea: HTMLDivElement) => void
  unmountDroppableArea: (droppableArea: HTMLDivElement) => void
  draggingItem: any
}

const DndContext = createContext<DndContextProps | null>(null)

interface Props {

}

const DndContextProvider = (props: Props) => {
  const droppableAreaList = useRef<HTMLDivElement[]>([])
  const draggingItem = useRef<any>(null)

  const mountDroppableArea = (droppableArea: HTMLDivElement) => {
    droppableAreaList.current.push(droppableArea)
  }

  const unmountDroppableArea = (droppableArea: HTMLDivElement) => {
    droppableAreaList.current = droppableAreaList.current.filter((v) => v !== droppableArea)
  }

  const handleStartDragging = () => {

  }

  return (
    <DndContext.Provider value={{draggingItem, mountDroppableArea, unmountDroppableArea}}>
    </DndContext.Provider>
  );
};

const useDndContext = () => {
  const dndContext = useContext(DndContext)
  if (!dndContext) {
    throw new Error('Cannot find DndContext')
  }
  return dndContext
}

const DroppableArea = () => {
  const ref = useRef<HTMLDivElement>(null)
  const {mountDroppableArea, unmountDroppableArea} = useDndContext()

  useEffect(() => {
    const el = ref.current;
    if (!el) {
      return;
    }

    mountDroppableArea(el)

    return () => {
      unmountDroppableArea(el)
    }
  }, [ref.current]);

  return (
    <div ref={ref}>

    </div>
  )
}

export default DndContext;