import './App.css';
import { DndController, DraggableDiv, DroppableDiv } from './common/components/dnd/Dnd';
import { useState } from 'react';

type Data = {
	name: string;
	groupSn: number;
	items: number[];
}

const defaultData: Data[] = [
	{ name: 'to do', groupSn: 1, items: [1, 2, 3] },
	{ name: 'in progress', groupSn: 2, items: [4, 5, 6] },
	{ name: 'done', groupSn: 3, items: [7, 8, 9] }
];

function App() {
	const [data, setData] = useState<Data[]>(defaultData);

	const handleMove = (itemSn: number, fromGroupSn: number, toGroupSn: number, index: number) => {
		if (fromGroupSn === toGroupSn) {
			setData(data.map(({ groupSn, items, name }) => ({
				name,
				groupSn,
				items: groupSn === fromGroupSn ? [...items.slice(0, index).filter(v => v !== itemSn), itemSn, ...items.slice(index).filter(v => v !== itemSn)] : items
			})));
			return;
		}

		setData(data.map(({ groupSn, items, name }) => ({
			name,
			groupSn,
			items: groupSn === fromGroupSn ? items.filter(v => v !== itemSn) : groupSn === toGroupSn ? [...items.slice(0, index), itemSn, ...items.slice(index)] : items
		})));
	};

	return (
		<>
			<DndController onMove={handleMove} dropIndicator={<div style={{ width: '100%', borderTop: '2px solid red' }} />}>
				<div style={{ display: 'flex', gap: 20 }}>
					{data.map((group, groupIdx) => (
						<DroppableDiv key={groupIdx + 1} sn={groupIdx + 1}>
							{({ dropHandlers, isDraggingOver }) => (
								<div {...dropHandlers} style={{
									display: 'flex',
									flexDirection: 'column',
									width: 200,
									gap: 20,
									background: isDraggingOver ? 'lightblue' : '#ddd',
									padding: 16
								}}>
									<div>{group.name}</div>
									{group.items.map((itemSn, i) => (
										<DraggableDiv key={itemSn} index={i} sn={itemSn}>
											{({ dragHandlers }) => <div {...dragHandlers}
																									style={{
																										height: 100,
																										background: '#aaa'
																									}}>{itemSn}</div>}
										</DraggableDiv>
									))}
								</div>
							)}

						</DroppableDiv>
					))}
				</div>
				<div>nothing</div>
			</DndController>
		</>

	);
}

export default App;
