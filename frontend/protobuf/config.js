/**
 * Created by Qingfeng.Shan(shanqingfeng@xuexibao.cn) on 2015/8/10.
 */
var require = {
    baseUrl: './',
    paths: {
        jquery: 'lib/jquery-2.1.1.min',
        Long: 'lib/protobuf/Long.min',
        ByteBuffer: 'lib/protobuf/ByteBufferAB.min',
        ProtoBuf: 'lib/protobuf/ProtoBuf.min',
    },
    shim: {
        Long: {
            exports: 'Long'
        },
        ByteBuffer: {
            exports: 'ByteBuffer'
        },
        ProtoBuf: {
            deps: ['Long', 'ByteBuffer'],
        },
    }
};
