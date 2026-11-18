import AdminScheduleWorkspace from './AdminScheduleWorkspace'
import StudentAcademicWorkspace from './StudentAcademicWorkspace'

export default function WorkspaceTab(props) {
  if (props.user.role === 'admin') {
    return (
      <AdminScheduleWorkspace
        events={props.events}
        recentlyEditedId={props.recentlyEditedId}
        onSelectEvent={props.onSelectEvent}
        onDeleteEvent={props.onDeleteEvent}
        onOpenAddModal={props.onOpenAddModal}
        onOpenEditModal={props.onOpenEditModal}
      />
    )
  }

  return (
    <StudentAcademicWorkspace
      user={props.user}
      events={props.events}
      remindedIds={props.remindedIds}
      checklist={props.checklist}
      onToggleChecklist={props.onToggleChecklist}
      onSelectEvent={props.onSelectEvent}
      onAddPersonalEvent={props.onAddPersonalEvent}
      onDeleteEvent={props.onDeleteEvent}
    />
  )
}
