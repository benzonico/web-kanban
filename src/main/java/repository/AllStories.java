package repository;

import com.google.common.base.*;
import com.google.common.collect.*;
import model.*;

import java.util.*;

import static com.google.common.base.Preconditions.*;
import static com.google.common.base.Strings.*;
import static com.google.common.collect.Iterables.*;
import static com.google.common.collect.Lists.*;

public class AllStories {
	private List<Story> stories = newArrayList(
			new Story(1, "TODO", "sleep at night"),
			new Story(2, "WIP", "rest in front of the tv"),
			new Story(3, "DONE", "eat. a lot."));

	public List<Story> list() {
		return ImmutableList.copyOf(stories);
	}

	public Story add(String state, String label) {
		checkArgument(!isNullOrEmpty(label), "Please provide a story label to add.");
		checkArgument(forName(label) == null, "The story '%s' already exists.", label);
		Story story = new Story(stories.size() + 1, state, label);
		stories.add(story);
		Clients.getInstance().notifyStoryAdded(story);
		return story;
	}

	public void update(final int id, final String state) {
		Story existingStory = forId(id);
		checkArgument(existingStory != null, "The story #%s does not exists.", id);
		stories.remove(existingStory);
		Story story = new Story(existingStory.id, state, existingStory.label);
		stories.add(story);
		Clients.getInstance().notifyStoryUpdated(story);
	}

	public void delete(int id) {
		Story existingStory = forId(id);
		checkArgument(existingStory != null, "The story #%s does not exists.", id);
		stories.remove(existingStory);
		Clients.getInstance().notifyStoryDeleted(id);
	}

	private Story forName(final String label) {
		try {
			return find(stories, new Predicate<Story>() {
				@Override
				public boolean apply(Story story) {
					return story.label.equals(label);
				}
			});
		} catch (NoSuchElementException e) {
			return null;
		}
	}

	private Story forId(final int id) {
		try {
			return find(stories, new Predicate<Story>() {
				@Override
				public boolean apply(Story story) {
					return story.id == id;
				}
			});
		} catch (NoSuchElementException e) {
			return null;
		}
	}
}
