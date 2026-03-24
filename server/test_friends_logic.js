const allText = "had day with friends went beach. had a nice day with friends to church. today i went out with my friends. today i went to the temple with my friends. enjoyed a lot with my friend brindha.";

const friendMentions = {
    Kavya: (allText.match(/kavya/g) || []).length,
    Ram: (allText.match(/ram/g) || []).length,
    Brindha: (allText.match(/brindha/g) || []).length,
    Friends: (allText.match(/friends/g) || []).length
};

console.log('Mentions:', friendMentions);
const topFriend = Object.entries(friendMentions).sort((a, b) => b[1] - a[1])[0];
console.log('Top friend:', topFriend);
