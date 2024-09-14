import express from 'express';
const router = express.Router();
import dotenv from 'dotenv';
dotenv.config();
import { Client } from '@elastic/elasticsearch';


const client = new Client({
    node: 'http://30.0.33.15:9200/',
    auth: {
        username: 'elastic',
        password: '123456',
    },
    ssl: {
        rejectUnauthorized: false,
    },
});

// searchAll method inside some class or module
class ElasticsearchService {
    constructor(esClient) {
        this._es = esClient;
    }

    async searchAll(params, select) {
        if (select && select.length && (select instanceof Array)) {
            params.body._source = select;
        }

        const allDocs = [];
        const responseQueue = [];
        let aggregations = undefined;

        params.scroll = '30s';  // Scroll time to keep the search context alive
        params.size = 10000;    // Number of documents per batch
        responseQueue.push(await this._es.search(params));

        while (responseQueue.length) {
            const response = responseQueue.shift().body;

            // Kiểm tra nếu `aggregations` tồn tại trước khi gán giá trị
            if (response.aggregations) {
                aggregations = response.aggregations;
            }

            if (response && response.hits && response.hits.hits) {
                response.hits.hits.forEach(function (hit) {
                    let doc = hit._source;

                    doc.id = hit._id;
                    doc.routing = hit._routing;
                    allDocs.push(doc);
                });

                if (response.hits.total.value === allDocs.length) {
                    await this._es.clearScroll({
                        scroll_id: response._scroll_id
                    }).catch(err => {
                        console.log(err);
                        return null;
                    });
                    break;
                }
            }

            // Tiếp tục cuộn để lấy thêm kết quả
            responseQueue.push(
                await this._es.scroll({
                    scrollId: response._scroll_id,
                    scroll: '30s'
                })
            );
        }

        return {
            total: allDocs.length || 0,
            data: allDocs,
            aggs: aggregations,  // Trả về aggregations nếu tồn tại
            aggregations: aggregations  // Trả về aggregations nếu tồn tại
        };
    }
}


const elasticService = new ElasticsearchService(client);

router.get('/list', async (req, res) => {
    try {
        const filterContext = [
            {
                term: {
                    type: 'physical_asset',
                },
            },
            {
                term: {
                    vendorId: 'zenbee',
                },
            },
        ];

        // Tìm kiếm các nhóm thiết bị
        const listGroupsResult = await client.search({
            index: 'vtc-physical_asset',
            body: {
                query: {
                    bool: {
                        filter: [
                            {
                                term: {
                                    type: 'device_group',
                                },
                            },
                            {
                                term: {
                                    managers: 'khoason_vt@vietnhatcorp.com.vn',
                                },
                            },
                        ],
                    },
                },
            },
        });

        
        // const listGroups = listGroupsResult.data.map(item => item.id);
        // // Thêm điều kiện lọc cho các thiết bị thuộc nhóm
        // filterContext.push({
        //     terms: {
        //         groups: listGroups,
        //     },
        // });

        // Tìm kiếm các thiết bị dựa trên filterContext
        const listDeviceResult = await client.search({
            index: 'vtc-physical_asset',
            body: {
                query: {
                    bool: {
                        filter: filterContext,
                    },
                },
            },
        });
        const hits = listDeviceResult.hits.hits;
        hits.forEach(function (hit) {
            console.log(hit._source);
        });      
        // Lấy danh sách các thiết bị
        // const listDevice = listDeviceResult.data;
        // Trả về kết quả
        // res.status(200).json({
        //     total: listDevice.length,
        //     data: listDevice,
        // });
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({
            message: 'An error occurred while fetching data.',
        });
    }
});

export default router;
