import { useOpenAlertModal } from "@/store/alert-modal";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { useDeletePost } from "@/hooks/mutations/post/use-delete-post";

export default function DeletePostButton({id}: {id: number}) {
    const openAlertModal = useOpenAlertModal();
    const {mutate: deletePost, isPending: isDeletePostPending} = useDeletePost({
        onError: (error) => {
            toast.error("게시글 삭제에 실패했습니다. 다시 시도해주세요.", {position: "top-center"});
        }
    });

    const handleDeleteClick = () => {
        openAlertModal({
            title: "게시글 삭제",
            description: "정말로 이 게시글을 삭제하시겠습니까?",
            onPositive: () => {
                deletePost(id);
            }
        });
    }

    return (
        <Button disabled={isDeletePostPending} className="cursor-pointer" variant={"ghost"} onClick={handleDeleteClick}>
            삭제
          </Button>
    )
}