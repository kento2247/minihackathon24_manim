rm -rf media/
mv Output/.gitignore temp.gitignore
mv Output/test.py temp.test.py
rm -rf Output/*
mv temp.gitignore Output/.gitignore
mv temp.test.py Output/test.py