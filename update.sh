source .env

# needs $LOCAL_REPO $REPO_URL and $BRANCH in .env

# We do it this way so that we can abstract if from just git later on
LOCAL_REPO_VC_DIR=$LOCAL_REPO/.git

if [ ! -d $LOCAL_REPO_VC_DIR ]
then
	echo $LOCAL_REPO 'folder not found, cloning'
    git clone $REPO_URL $LOCAL_REPO
    cd $LOCAL_REPO
    git checkout $BRANCH
else
	echo $LOCAL_REPO 'folder found, pulling'
    cd $LOCAL_REPO
    # git pull $REPOSRC
	git reset --hard
	git fetch --all
	git checkout $BRANCH
	git reset --hard origin/$BRANCH
fi

echo '############ Last Commit ############'
git --no-pager log --oneline -1
