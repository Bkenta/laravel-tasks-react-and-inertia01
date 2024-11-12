import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';

/**
 * 登録フォーム
 */
function StoreEdit({ addTaskCntByStatus }){
    const [ isStoreError, setIsStoreError ] = useState(false);
    const { data, setData, post, reset, hasErrors, wasSuccessful, recentlySuccessful } = useForm({
        title: "",
        due_date: "",
    })
    const { errors } = usePage().props;
    const today = new Date().toLocaleDateString(
        "ja-JP",
        {
            year: "numeric",
            month: "2-digit", 
            day: "2-digit"
        }
    ).replaceAll('/', '-');

    function handleSubmit(e){
        e.preventDefault();
        post(route('tasks.store', data), {
            onSuccess: () => {
                reset(); // エラーが発生していなければフォームをクリアする
                setIsStoreError(false);
                addTaskCntByStatus(1); // 「未着手」の件数を「+1」する
            },
            onError: () => {
                setIsStoreError(true);
            },
        });
    }

    return (
        <>
            <form
                id='edit-form'
                className='flex gap-4 justify-center items-center mt-16 mb-16 pb-8 border-b-2 border-b-slate-200 relative'
                onSubmit={(e) => {handleSubmit(e);}}
            >
                {recentlySuccessful && <p className='text-center absolute -top-12'>タスクを登録しました。</p>}
                <div className='relative'>
                    <label 
                        htmlFor="title" 
                        className='font-medium'
                    >
                        タイトル：
                    </label>
                    <input 
                        id="title" 
                        value={data.title} 
                        onChange={(e) => setData('title', e.target.value)}
                    />
                    {
                        (isStoreError && errors.title) && 
                            <p className='text-red-500 font-semibold absolute top-12'>
                                {errors.title}
                            </p>
                    }
                </div>
                <div className='relative'>
                    <label 
                        htmlFor="due_date" 
                        className='font-medium'
                    >
                        期限日：
                    </label>
                    <input 
                        id="due_date" 
                        type="date" 
                        value={data.due_date} 
                        min={today}
                        onChange={(e) => setData('due_date', e.target.value)}
                    />
                    {
                        (isStoreError && errors.due_date) && 
                            <p className='text-red-500 font-semibold absolute top-12'>
                                {errors.due_date}
                            </p>
                    }
                </div>
                <button 
                    className='inline-flex h-6 items-center justify-center rounded-md bg-blue-600 p-4 font-medium text-neutral-50 transition active:scale-110 hover:opacity-80'
                    type="submit"
                >
                    追加
                </button>
            </form>
        </>
    );
}

/**
 * 削除ボタン
 */
function DeleteBtn({ id, isEditMode, takeTaskCntByStatus }) {
    const { delete:destroy } = useForm({ });

    function handleSubmit(e) {
        e.preventDefault();
        destroy(route('tasks.destroy', { id }), {
            onBefore: () => confirm('本当に削除しますか？'),
            onSuccess: () => takeTaskCntByStatus(),
        });
    }

    return (
        <>
            { ! isEditMode && 
                <form 
                    className='flex items-center justify-center' 
                    action="post" 
                    onSubmit={(e) => {handleSubmit(e)}}
                >
                    <button className='inline-flex h-6 items-center justify-center hover:opacity-80 w-7'>
                        <img src={'img/tasks/trash.png'} alt="削除ボタン"></img>
                    </button>
                </form>
            }
        </>
    );
}

/**
 * 編集ボタン
 */
function EditBtn({ isEditMode, cancelControl }){
    const editBtnStyle ="flex items-center justify-center hover:opacity-80 cursor-pointer";

    return (
        <>
            <div className='flex gap-x-3'>
                <button 
                    type='submit' 
                    className={`w-10 ${editBtnStyle}`}
                >
                    <img src={`img/tasks/` + (isEditMode ? 'pen_writing.png' : 'pen_not_writing.png')} alt="ペン"></img>
                </button>
                <a 
                    id='editCancelBtn' 
                    className={`w-8 -mr-4 ${editBtnStyle} ` + (! isEditMode && 'hidden') } 
                    onClick={ cancelControl }
                >
                    <img src={'img/tasks/batsu.png'} alt="キャンセル" ></img>
                </a>
            </div>
        </>
    );
}

/**
 * 状態セレクトボックス
 */
const StatusSelectBox = ({ statusId, statusData, setData }) => {
    const [ selectedOption, setSelectedOption ] = useState(statusId);
    const statusOptions = Object.keys(statusData).map((index) => {
        return <option key={index} value={index}>{statusData[index]}</option>
    });

    const handleChange = (e) => {
        setSelectedOption(e.target.value);
        setData('status', e.target.value);
    }

    return (
        <select
            className='py-1 pl-2 pr-8'
            value={selectedOption}
            onChange={(e) => handleChange(e)}
        >
            {statusOptions}
        </select>
    )
}

/**
 * 行要素
 */
const TaskRow = ({ id, title, status, dueDate, statusData, calcTaskCntByStatus, takeTaskCntByStatus }) => {
    const [ isEditMode, setIsEditMode ]   = useState(false);
    const [ isEditError, setIsEditError ] = useState(false);
    const { data, setData, put } = useForm({
        title: title,
        status: status,
        due_date: dueDate,
    });
    const { errors } = usePage().props;
    const today = new Date().toLocaleDateString(
        "ja-JP",
        {
            year: "numeric",
            month: "2-digit", 
            day: "2-digit"
        }
    ).replaceAll('/', '-');
    
    // status別タスク数カウント用
    const [ beforeStatus, setBeforeStatus ] = useState(status);

    // ********** style **********
    const styleErrorMsg = 'text-red-500 font-semibold text-md';
    const styleCntTaskLabel = 'rounded-md text-sm flex items-center justify-center py-1';
    const bgColorCntTaskLabel = {
        1: 'bg-red-500',
        2: 'bg-blue-500',
        3: 'bg-green-500',
    }
    // ***************************

    function handleSubmit(e) {
        e.preventDefault();
        put(route('tasks.update', { id }), {
            onSuccess: () => {
                setIsEditMode(false);
                setIsEditError(false);
                handleCalcTaskCntByStatus(); // status別タスク数カウント用
            },
            onError: () => {
                setIsEditError(true);
            },
        });
    }

    // status別タスク数の加減算（+1、-1）
    function handleCalcTaskCntByStatus() {
        calcTaskCntByStatus(beforeStatus, data.status);
        setBeforeStatus(data.status);
    }

    // status別タスク数「-1」
    function handleTakeTaskCntByStatus() {
        takeTaskCntByStatus(beforeStatus);
        setBeforeStatus(data.status);
    }

    // 編集モードへ移行する
    // このとき編集処理を実行させない
    function handleCancelSubmit(e) {
        e.preventDefault();
        setIsEditMode(true);
        return false;
    }

    // 編集キャンセル
    function handleCancelEdit() {
        setIsEditMode(false);
        setIsEditError(false);
        setData({
            title: title,
            status: status,
            due_date: dueDate,
        });
        delete errors.title;
        delete errors.status;
        delete errors.due_date;
    }

    return (
        <>
            {
                (isEditMode && isEditError)
                    &&  <div className='mb-2 w-[700px] mx-auto'>
                            { (errors.title)    && <p className={styleErrorMsg}>{errors.title}</p> } 
                            { (errors.status)   && <p className={styleErrorMsg}>{errors.status}</p> } 
                            { (errors.due_date) && <p className={styleErrorMsg}>{errors.due_date}</p> } 
                        </div>
            }

            <li className={'w-[700px] mx-auto flex justify-end items-center group relative h-16 mb-2'}>
                <form 
                    className='flex flex-1 justify-start items-center gap-x-2'
                    action="post" 
                    onSubmit={(e) => {
                        {isEditMode ? handleSubmit(e) : handleCancelSubmit(e)}
                    }}
                >
                    <div className={'flex flex-initial items-center gap-x-10 w-full shadow sm:rounded-lg p-4 my-2 ' + (isEditMode ? 'bg-slate-300' : 'bg-white')}>
                        <div className='w-2/5'>
                            <p>
                                {isEditMode
                                    ? <input 
                                        className={`py-1 + ${errors.title && 'border-red-500 border-4'}`} 
                                        type="text" 
                                        value={data.title} 
                                        onChange={(e) => setData('title', e.target.value)}
                                      />
                                    : title
                                }
                            </p>
                        </div>
                        <div className='w-1/12'>
                            <p className={`text-center ${styleCntTaskLabel} ${ ! isEditMode && (bgColorCntTaskLabel[status] + ' text-white font-bold') }`}>
                                {isEditMode
                                    ? <StatusSelectBox 
                                        statusId={status} 
                                        statusData={statusData} 
                                        setData={setData} 
                                      />
                                    : statusData[status]
                                }
                            </p>
                        </div>
                        <div className='w-3/12'>
                            <p className='text-center'>
                                {isEditMode
                                    ? <input 
                                        className={`py-1 + ${errors.due_date && 'border-red-500 border-4'}`} 
                                        type="date" 
                                        min={today}
                                        value={data.due_date} 
                                        onChange={(e) => setData('due_date', e.target.value)} 
                                      />
                                    : dueDate
                                }
                            </p>
                        </div>
                    </div>
                    <span className={`group-hover:inline-block top-2/4 -translate-y-1/2 absolute ` + (isEditMode ? 'right-12' : 'right-20 hidden')}>
                        <EditBtn
                            isEditMode={isEditMode}
                            cancelControl={handleCancelEdit}
                        />
                    </span>
                </form>
                <span className='group-hover:inline-block hidden right-8 absolute'>
                    <DeleteBtn 
                        id={id}
                        isEditMode={isEditMode}
                        takeTaskCntByStatus={handleTakeTaskCntByStatus}
                    />
                </span>
            </li>
        </>
    );
};

/**
 * タスクリスト全体
 */
export default function Tasks({tasks, msg, status}) {
    const [statusCnt, setStatusCnt] = useState(iniTaskCntByStatus(tasks));

    // ********** style **********
    const styleCntTaskFlex  = 'flex items-center gap-x-2';
    const styleCntTaskLabel = 'rounded-md text-white py-1 px-2 font-bold';
    const bgColorCntTaskLabel = {
        1: 'bg-red-500',
        2: 'bg-blue-500',
        3: 'bg-green-500',
    }
    // ***************************

    // status別タスク数の初期計算
    function iniTaskCntByStatus(tasks) {
        let nonStarted = 0;
        let starting   = 0;
        let finished   = 0;

        tasks.map((value) => {
            if (value.status == 1) {
                nonStarted++;
            } else if (value.status == 2) {
                starting++;
            } else if (value.status == 3) {
                finished++;
            } 
        });
        return { 1: nonStarted, 2: starting, 3: finished }
    }

    // status別タスク数の加減算を行う
    function calcTaskCntByStatus(takeKey, addKey) {
        let currentStatusCnt = statusCnt;
        currentStatusCnt[addKey]++;
        currentStatusCnt[takeKey]--;
        setStatusCnt(currentStatusCnt);
    }

    function addTaskCntByStatus(addKey) {
        let currentStatusCnt = statusCnt;
        currentStatusCnt[addKey]++;
        setStatusCnt(currentStatusCnt);
    }

    function takeTaskCntByStatus(takeKey) {
        let currentStatusCnt = statusCnt;
        currentStatusCnt[takeKey]--;
        setStatusCnt(currentStatusCnt);
    }

    return (
        <>
            <AuthenticatedLayout>
                <Head title="タスク一覧" />

                <div className='px-5 w-3xl mx-auto overflow-hidden'>

                    <StoreEdit 
                        addTaskCntByStatus={addTaskCntByStatus}
                    />

                    <div className='flex w-[700px] pr-4 pl-1 mx-auto mb-3 gap-x-10 flex-initial'>
                        <span className='font-semibold w-2/5'>タイトル</span>
                        <span className='font-semibold w-1/12 text-center'>状態</span>
                        <span className='font-semibold w-3/12 text-center'>期限日</span>
                    </div>
                    <ul className='mx-auto max-h-80 overflow-scroll'>
                        {tasks.map((task, i) => (
                            <TaskRow 
                                key={task.id}
                                id={task.id}
                                title={task.title}
                                status={task.status}
                                statusData={status}
                                dueDate={task.due_date}
                                takeTaskCntByStatus={takeTaskCntByStatus}
                                calcTaskCntByStatus={calcTaskCntByStatus}
                            />
                        ))}
                    </ul>
                    <div className='flex gap-6 mt-10 items-center justify-center'>
                        <dl className={`${styleCntTaskFlex}`}>
                            <dt className={`bg-slate-400 + ${styleCntTaskLabel}`}>全タスク数</dt>
                            <dd className='font-bold'>{Object.keys(tasks).length} 件</dd>
                        </dl>
                        {
                            Object.keys(status).map((key) => (
                                <dl key={key} className={`${styleCntTaskFlex}`}>
                                    <dt className={`${bgColorCntTaskLabel[key]} ${styleCntTaskLabel}`}>{status[key]}</dt>
                                    <dd className='font-bold'>{ statusCnt[key] } 件</dd>
                                </dl>
                            ))
                        }
                    </div>
                </div>
            </AuthenticatedLayout>
        </>
    );
}
