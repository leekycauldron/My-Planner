import os, datetime
####FILE HANDLING####
def uploadfile(content, filename):
    if os.path.isfile(f'notes/{filename}.md'):
        return False

    with open(f'notes/{filename}.md', 'wb+') as destination:
            destination.write(content.encode())
    return True

def getFile(filename):
    try:
        with open(f'notes/{filename}.md', 'r') as destination:
                return destination.read()
    except FileNotFoundError:
        return False

def editFile(filename,content):
    os.remove(f'notes/{filename}.md')
    with open(f'notes/{filename}.md', 'wb+') as destination:
            destination.write(content.encode())
def removeFile(filename):
    os.remove(f'notes/{filename}.md')
####DATE FORMATTING####
def dateNowFormat():   
    dateNow = datetime.datetime.now()
    dateNow = dateNow.strftime(f"%Y-%m-%d")
    dateNow = datetime.datetime.strptime(dateNow, f"%Y-%m-%d")

    return dateNow 