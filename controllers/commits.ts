import Commit from "../models/commitSchema";
import { Request, Response } from "express";


export const getCommitsByRepo = async (req: Request, res: Response) => {

    const { repoID } = req.params

    const commits = await Commit.find({ repository: repoID})
            .select('-hash')
            .sort({ createdAt: -1 }); // Orden descendente por fecha de creación


    res.json({
        commits
    });

}

export const getCommitDiff = async (req: Request, res: Response) => {
    const { repoGitlabID, commit: { hash } } = req;

    const url = `https://gitlab.com/api/v4/projects/${encodeURIComponent(repoGitlabID)}/repository/commits/${hash}/diff`;
    try {
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${process.env.GITLAB_ACCESS_TOKEN}` },
      });

      console.log(response)

      if (!response.ok) { // Verifica si la respuesta HTTP es exitosa (status en el rango 200-299)
        return res.status(response.status).json({ message: `Error from GitLab API: ${response.statusText}` });
      }

      const data = await response.json();
      res.json(data);

    } catch (error) {
      console.error('Error fetching commit diffs:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
};



export const getProyectCommits = async (req: Request, res: Response) => {
    const { projectID } = req.params;
    const { owner, commits } = req
    const year = parseInt(req.query.year, 10); // Asegúrate de convertir el año a número

    try {

      if( owner && owner === true ) {
        let matchConditions = { project: projectID };
        if( year ){
          matchConditions = {
            ...matchConditions,
            createdAt: {
              $gte: new Date(`${year}-01-01T00:00:00.000Z`),
              $lte: new Date(`${year}-12-31T23:59:59.999Z`)
            }
          };
        }

          const commits = await Commit.find(matchConditions)
                  .select('-hash')
                  .sort({ createdAt: -1 });

          return res.json({
              commits
          });
      } else {
        return res.json({
          commits
        });
      
      }

    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: 'Internal Server Error'
        });
    }
}


