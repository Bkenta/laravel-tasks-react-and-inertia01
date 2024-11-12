<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTaskRequest;
use App\Http\Requests\UpdateTaskRequest;
use App\Models\Task;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class TaskController extends Controller
{
    function index(Request $request, Task $task)
    {
        $msg = '';
        if ($request->session()->has('msg')){
            $msg = $request->session()->get('msg');
        }

        return Inertia::render('Tasks/Tasks', [
            'tasks' => Auth::user()->descTasks,
            'msg' => $msg,
            'status' => TASK::STATUS,
        ]);
    }

    function store(StoreTaskRequest $request, Task $task)
    {

        $task->user_id = Auth::id();
        $task->title = $request->title;
        $task->due_date = $request->due_date;
        $task->save();

        session()->flash('msg', 'タスクを登録しました。');
        return redirect()->route('tasks.index');
    }

    function update(UpdateTaskRequest $request, Task $task)
    {
        $task->title = $request->title;
        $task->due_date = $request->due_date;
        $task->status = $request->status;

        $task->save();
        return redirect()->route('tasks.index');
    }

    function destroy(Task $task)
    {
        $task->delete();

        session()->flash('msg', '削除');
        return redirect()->route('tasks.index');
    }
}
