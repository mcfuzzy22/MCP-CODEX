# 3D Picker (Tarkov-style sockets)

## Data
- Slot(slot_id, code, name, category_id, transform_json, is_required)
- SlotEdge(parent_slot_id, child_slot_id, position)
- PartSlot(part_id, slot_id, local_transform_json)

## Runtime
- Load base engine GLTF + invisible socket meshes
- Highlight eligible sockets for selected category
- Drag part to socket => POST selection => update scene
