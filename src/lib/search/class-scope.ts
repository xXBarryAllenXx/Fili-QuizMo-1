import { loadTeacherClasses } from "@/lib/classes/server";
import { SearchError } from "@/lib/search/errors";

/**
 * The usernames in one of this teacher's own classes, for the class filter.
 * The backend only returns the signed-in teacher's classes, so a class id that
 * is not theirs is simply "not found". Returns undefined when no class is
 * selected.
 */
export async function resolveClassUsernames(
  classId: string | undefined,
): Promise<string[] | undefined> {
  if (!classId) return undefined;

  const classes = await loadTeacherClasses();
  if (!classes) {
    throw new SearchError(
      503,
      "CLASSES_UNAVAILABLE",
      "Classes are not available right now. Clear the class filter or try again.",
    );
  }

  const selected = classes.find((item) => item.classId === classId);
  if (!selected) {
    throw new SearchError(
      404,
      "CLASS_NOT_FOUND",
      "That class was not found. It may have been deleted.",
    );
  }

  return selected.students.map((student) => student.username);
}
