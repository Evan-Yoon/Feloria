import sharp from "sharp";
import fs from "fs";
import path from "path";

const ICON_SIZE = 24;
const INPUT = "./public/assets/system/IconSet.png";
const OUTPUT_DIR = "./public/assets/icons";

if (!fs.existsSync(INPUT)) {
    console.error(`입력 파일을 찾을 수 없습니다: ${INPUT}`);
    process.exit(1);
}

fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const image = sharp(INPUT);
const metadata = await image.metadata();

const { width, height } = metadata;

if (!width || !height) {
    console.error("이미지 크기를 읽을 수 없습니다.");
    process.exit(1);
}

if (width % ICON_SIZE !== 0 || height % ICON_SIZE !== 0) {
    console.warn(
        `경고: 이미지 크기(${width}x${height})가 ${ICON_SIZE}로 나누어떨어지지 않습니다.`
    );
}

const cols = Math.floor(width / ICON_SIZE);
const rows = Math.floor(height / ICON_SIZE);

console.log(`분할 시작: ${width}x${height} -> ${cols}열 x ${rows}행`);

for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
        const outputPath = path.join(
            OUTPUT_DIR,
            `icon_${String(row).padStart(2, "0")}_${String(col).padStart(2, "0")}.png`
        );

        await sharp(INPUT)
            .extract({
                left: col * ICON_SIZE,
                top: row * ICON_SIZE,
                width: ICON_SIZE,
                height: ICON_SIZE,
            })
            .toFile(outputPath);
    }
}

console.log("분할 완료");