# RAWDOG 项目入口

RAWDOG（RAdio White Dwarf catalOG）汇集白矮星系统及相关候选体的射电观测、物理性质、文献和证据。

当前目录数据版本为 **1.0.2**，网站版本为 **web r22**。目录包含 58 个系统、96 条射电观测、7,175 条证据记录和 669 条参考文献。

## 核心文件

| 位置 | 内容 |
| --- | --- |
| [README.md](README.md) | 项目概览、公开入口和引用方式 |
| [index.html](index.html) | 网站入口 |
| [assets/](assets/) | 网页样式、交互、逐源详情和主表坐标 |
| [data/v1.0.2/](data/v1.0.2/) | 正式目录、射电观测、物理性质、证据、参考文献和校验和 |
| [data/v1.0.2-web-r10/](data/v1.0.2-web-r10/) | 网页使用的射电和 X-ray 证据索引 |
| [data/v1.0.2-web-r13/](data/v1.0.2-web-r13/) | 当前 Gaia CMD 输入和距离采用记录 |
| [figures/](figures/) | 各版本科学图件及可下载文件 |
| [docs/](docs/) | 数据字典、方法、版本记录和验证报告 |
| [scripts/](scripts/) | 构建、打包和一致性检查脚本 |

各历史版本的数据、图件和压缩包位于相应版本目录，可用于追溯与复现。

## 本地预览

在项目根目录运行以下命令，然后打开 <http://localhost:8000/>。

```sh
python -m http.server 8000 --bind 127.0.0.1
```

## 发布前检查

在安装了项目科学计算依赖的 Python 环境中运行以下检查。网页检查使用 Node.js。完整构建和打包步骤见[复现说明](docs/REPRODUCING.md)。

```sh
python scripts/check.py
python scripts/cmd_revision.py --check
python scripts/table_coordinates.py --check
python scripts/emission_inputs.py --check
node scripts/check_presentation.js
```

2026-11-06 的检查环境为 Python 3.13.9、Astropy 7.2.0、NumPy 2.4.3 和 Matplotlib 3.10.8。以上检查全部通过。157 个已发布的数据、图件和逐源文件与发布前的公开 main 分支逐字节一致。

## 阅读数据时的约定

- 主表 RA、Dec 使用 FK5、分点 J2000，分别显示时分秒和度分秒。Gl、Gb 显示四位小数。坐标输入、历元和个别源的参考系限定见[坐标方法](docs/TABLE_COORDINATES_FK5_J2000.md)。
- 射电列按原始频段展示观测值。重复观测可以展开，每个数值链接到对应观测和证据。峰值亮度使用 µJy beam⁻¹，上限和边缘信号有明确标签。
- Gaia CMD 包含 56 个系统，另外两个系统的排除理由见[当前 CMD 方法](docs/CMD_REVISION_WEB_R13.md)。
- 系统分类、host confidence、测量误差、模型假设和待审阅问题均可在逐源详情和证据中查看。

## 公开入口

- 网站 <https://psr-jake.github.io/RAWDOG/>
- 仓库 <https://github.com/PSR-Jake/RAWDOG>
- [版本记录](docs/RELEASE_NOTES.md)
- [引用信息](README.md#citation)
