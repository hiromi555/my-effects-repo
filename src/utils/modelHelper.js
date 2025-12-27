//モデルのレスポンシブ対応用
export function updateModel(model, scaleRatio, aspectRatio, scaleValues, positionXValues = null) {
    if (!model) return;
    let scale = scaleRatio < 1 ? scaleValues[0] : scaleValues[1];
    model.scale.set(scale, scale, scale);
    if (positionXValues) {
        let xpos = aspectRatio < 1 ? positionXValues[0] : positionXValues[1];
        model.position.x = xpos;
    }
}
